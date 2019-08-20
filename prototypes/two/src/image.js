/*******************************************
    This here is the image library in js
*******************************************/


/***
    Data Definitions:
    
    An Image is one of
      - Circle
      - Rectangle
      - Triangle
      - Beside
      - Above
      - Overlay

    A Circle is
      {r:     Integer,
       color: Color,
       type:  'circle'}
     
    A Rectangle is
      {width:  Integer,
       height: Integer,
       color:  Color,
       type:   'rect'}
       
    A Triangle is
      {base:   Integer,
       width:  Integer,
       color:  Color,
       type:   'triang'}
       
    A Beside is
      {type: 'beside',
       images: [Image]} note: images must be non-empty
       
    An Above is
      {type: 'above',
       images: [Image]} note: images must be non-empty

    An Overlay is
      {type: 'overlay',
       images: [Image]} note: images must be non-empty
       
    A Color is
      ??? (r, g, b, a)?
       
***/

/*
TODO:
  Figure out how to represent colors
  Figure out how [SVG]s should work (render_beside etc.)
*/

// Integer Color -> Image
function makeCircle (r, color) {
    return {r, color, type: 'circle'};
}

// Integer Integer Color -> Image
function makeRect (width, height, color) {
    return {width, height, color, type: 'rect'};
}

// Integer Integer Color -> Image
function makeTriang (base, width, color) {
    return {base, width, color, type: 'triang'};
}

// [Image] -> Image
function makeBeside (images) {
    return {images, type: 'beside'};
}

// [Image] -> Image
function makeAbove (images) {
    return {images, type: 'above'};
}

// [Image] -> Image
function makeOverlay (images) {
    return {images, type: 'overlay'};
}

// Image -> Integer
function width (image) {
    switch (image.type) {
    case 'circle':
        return image.r * 2;
    case 'rect':
        return image.width;
    case 'triang':
        throw Error (`Triangles not implemented yet`);
    case 'beside':
        return width_beside(image.images);
    case 'above':
        return width_above(image.images);
    case 'overlay':
        return width_overlay(image.images);
    default:
        return Error ('Unknown Image');
    }
}

// [Image] -> Integer
function width_beside (images) {
    return images.reduce((acc, image) => acc + width(image), 0);
}

// [Image] -> Integer
function width_above (images) {
    return images.reduce((acc, image) => Math.max(acc, width(image)), 0);
}

// [Image] -> Integer
function width_overlay (images) {
    return images.reduce((acc, image) => Math.max(acc, width(image)), 0);
}

// Image -> Integer
function height (image) {
    switch (image.type) {
    case 'circle':
        return image.r * 2;
    case 'rect':
        return image.height;
    case 'triang':
        throw Error (`Triangles not implemented yet`);
    case 'beside':
        return height_beside(image.images);
    case 'above':
        return height_above(image.images);
    case 'overlay':
        return height_overlay(image.images);
    default:
        return Error ('Unknown Image');
    }
}

// [Image] -> Integer
function height_beside (images) {
    return images.reduce((acc, image) => Math.max(acc, height(image)), 0);
}

// [Image] -> Integer
function height_above (images) {
    return images.reduce((acc, image) => acc + height(image), 0);
}

// [Image] -> Integer
function height_overlay (images) {
    return images.reduce((acc, image) => Math.max(acc, height(image)), 0);
}

// Image Integer Integer -> SVG
function render (image, x, y) {
    switch (image.type) {
    case 'circle':
        return <circle cx={x + image.r} cy={y + image.r} r={image.r}/>;
    case 'rect':
        return <rect x={x} y={y} width={image.width} height={image.height}/>;
    case 'triang':
        throw Error (`Triangles not implemented yet`);
    case 'beside':
        return render_beside(image.images, x, y);
    case 'above':
        return render_above(image.images, x, y);
    case 'overlay':
        return render_overlay(image.images, x, y);
    default:
        throw Error (`Unknown Image Type: ${image.type}`);
    }
}

// Image Integer Integer -> [SVG]
function render_beside (images, x, y) {
    if (images.length === 1) {
        return [render(images[0], x, y)];
    }

    return [render(images[0], x, y), ...render_beside(images.splice(1), width(images[0]), y)];
}

// Image Integer Integer -> [SVG]
function render_above (images, x, y) {
    if (images.length === 1) {
        return [render(images[0], x, y)];
    }

    return [render(images[0], x, y), ...render_above(images.splice(1), x, height(images[0]))];
}

// Image Integer Integer -> [SVG]
function render_overlay (images, x, y) {
    if (images.length === 1) {
        return [render(images[0], x, y)];
    }

    return [render(images[0], x, y), ...render_overlay(images.splice(1), x, y)];
}
