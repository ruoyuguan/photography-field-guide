import assert from 'node:assert/strict';

export async function checkEditingGeometry({ evaluate, navigate, viewport }) {
  await viewport(1366, 768);
  for (const prefix of ['', '/zh-cn']) {
    await navigate(prefix + '/learn/workflow/lightweight-editing/');
    const models = await evaluate(`(() => {
      const serialize = (group, colors) => [...group.children].map(shape => ({
        tag: shape.tagName,
        attributes: Object.fromEntries([...shape.attributes]
          .filter(attribute => colors || !['fill', 'stroke'].includes(attribute.name))
          .map(attribute => [attribute.name, attribute.value])),
      }));
      return [...document.querySelectorAll('[data-editing-comparison]')].map(figure => {
        const before = figure.querySelector('svg[data-editing-state="before"]');
        const after = figure.querySelector('svg[data-editing-state="after"]');
        const source = before.querySelector('[data-editing-source-scene]');
        const variant = after.querySelector('[data-editing-source-scene]');
        const crop = figure.querySelector('rect[stroke-dasharray]');
        return {
          id: figure.dataset.editingComparison,
          before: serialize(source, true),
          after: serialize(variant, true),
          beforeGeometry: serialize(source, false),
          afterGeometry: serialize(variant, false),
          retained: crop && ['x', 'y', 'width', 'height'].map(key => crop.getAttribute(key)).join(' '),
          afterViewBox: after.getAttribute('viewBox'),
        };
      });
    })()`);
    assert.deepEqual(
      models.map(model => model.id),
      ['exposure', 'white-balance', 'crop']
    );
    for (const model of models) {
      assert.deepEqual(
        model.before,
        models[0].before,
        `${prefix}/${model.id}: every trial starts from the same geometry and palette`
      );
      assert.deepEqual(
        model.beforeGeometry,
        model.afterGeometry,
        `${prefix}/${model.id}: rendering/crop keeps scene geometry`
      );
      if (model.id === 'crop') {
        assert.deepEqual(
          model.before,
          model.after,
          'Crop must not also change source colors'
        );
        assert.equal(
          model.afterViewBox,
          model.retained,
          'Crop window exactly matches the retained boundary'
        );
      } else {
        assert.notDeepEqual(
          model.before,
          model.after,
          'The rendering trial visibly changes its intended variable'
        );
      }
    }
  }
  console.log(
    'OK bilingual C6 common baseline, unchanged geometry and exact crop boundary'
  );
}
