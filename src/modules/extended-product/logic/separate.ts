export const divideProduct = product => {
  if (!product) {
    throw new Error('ProductColorTiles not received "product" props');
  }

  if (
    !product.hasOwnProperty("configurable_options") ||
    !product.color_options ||
    product.color_options.length < 1
  ) {
    // No colors fallback
    return product;
  }

  const colorObj = product.configurable_options.find(
    v => v.attribute_code === "color"
  );
  if (!colorObj || !colorObj.values) {
    return product;
  }

  const color_options = colorObj.values;

  const products = {};
  for (let curr of product.configurable_children) {
    if (!products.hasOwnProperty(curr.color)) {
      const colorObj = color_options.find(v => v.value_index === curr.color);
      if (!colorObj) {
        throw new Error(
          'Badly configured product "' +
            curr.name +
            "\", Product's color: " +
            curr.color +
            " !== Each color option in parent"
        );
      }

      const baseProduct = {
        ...product,
        ...curr,
        name: `${product.name.trim()} ${colorObj.label}`
      };
      baseProduct.configurable_children = [curr];
      products[curr.color] = baseProduct;
    } else {
      products[curr.color].configurable_children.push(curr);
    }
  }
  return Object.values(products);
};

export const count = product => {
  if (!product) {
    throw new Error('ProductColorTiles not received "product" props');
  }

  if (!product.hasOwnProperty("configurable_options")) {
    // No colors fallback
    return 1;
  }
  const colorsObject = product.configurable_options.find(
    v => v.attribute_code === "color"
  );

  if (!colorsObject) {
    // No colors fallback
    return 1;
  }

  // const colors = colorsObject.values.map(v => v.label);

  const products = product.configurable_children.reduce((total, curr) => {
    const parts = curr.name.split("/");
    parts.pop();
    const name = parts.join("/");

    if (!total.hasOwnProperty(name)) {
      total[name] = 1;
    }

    return total;
  }, {});

  return Object.keys(products).length;
};
