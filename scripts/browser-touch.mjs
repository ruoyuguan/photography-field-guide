import assert from 'node:assert/strict';

/** Tap a native control and verify that Chrome delivered a trusted touch. */
export async function tap(call, evaluate, selector) {
  await call('Page.bringToFront', {});
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    window.pfgObservedTouch = {
      hit: element.contains(document.elementFromPoint(x, y)),
      visibility: document.visibilityState,
      event: null,
    };
    document.addEventListener('pointerdown', event => {
      window.pfgObservedTouch.event = {
        intended: element.contains(event.target),
        trusted: event.isTrusted,
        type: event.pointerType,
      };
    }, { once: true, capture: true });
    return { x, y };
  })()`);
  assert.ok(point, `Missing or hidden touch target: ${selector}`);
  // This CDP path reaches the touch pipeline without waiting for the
  // raw touch-event acknowledgement that stalls on some headless targets.
  for (const type of ['mousePressed', 'mouseReleased']) {
    await call('Input.emulateTouchFromMouseEvent', {
      type,
      ...point,
      button: 'left',
      clickCount: 1,
    });
  }
  for (let attempt = 0; attempt < 25; attempt++) {
    const probe = await evaluate('window.pfgObservedTouch');
    if (probe.event) {
      assert.deepEqual(
        probe.event,
        { intended: true, trusted: true, type: 'touch' },
        `Unexpected pointer input at ${selector}: ${JSON.stringify(probe)}`
      );
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  const probe = await evaluate('window.pfgObservedTouch');
  assert.fail(
    `No trusted touch arrived at ${selector}: ${JSON.stringify(probe)}`
  );
}
