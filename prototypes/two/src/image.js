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
       mode:  String,
       type:  'circle'}
     
    A Rectangle is
      {width:  Integer,
       height: Integer,
       color:  Color,
       mode:   String,
       type:   'rect'}
       
    A Triangle is
      {??? (a, b, c maybe?),
       color:  Color,
       mode:   String,
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
      {r: Integer,
       g: Integer,
       b: Integer,
       a: Integer}
***/

/*
TODO:
  Figure out how [SVG]s should work (render_beside etc.)
  Figure out how triangles should work
*/

// Integer Color -> Image
function makeCircle (r, color, mode) {
    return {r, color, mode, type: 'circle'};
}

// Integer Integer Color -> Image
function makeRect (width, height, color, mode) {
    return {width, height, color, mode, type: 'rect'};
}

// Integer Integer Color -> Image
function makeTriang (base, width, color, mode) {
    return {base, width, color, mode, type: 'triang'};
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

// Integer, Integer, Integer[, Integer] -> Color 
function makeColor (r, g, b, a = 255) {
    return {r, g, b, a};
}

// Color, Integer -> Color
function changeAlpha (color, a) {
    return {...color, a};
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
        return render_circle(image, x, y);
    case 'rect':
        return render_rect(image, x, y);
    case 'triang':
        return render_triang(image, x, y);
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

function render_circle (image, x, y) {
    let red = image.color.r;
    let green = image.color.g;
    let blue = image.color.b;
    // for some reason alpha is the only float in rgba in css...
    let alpha = image.color.a / 255;
    switch (image.mode) {
    case 'solid':
        return <circle cx={x + image.r}
                       cy={y + image.r}
                       r={image.r}
                       fill={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
               />;
    case 'outline':
        // stroke is pretty annoying...
        // it draws both outside of the shape and inside it...
        //so it's difficult to figure out where exactly it wants to draw

        // this should draw the outline of a circle (approximately)
        // not sure how it works on browsers besides firefox though
        return <circle cx={x + image.r}
                       cy={y + image.r}
                       r={image.r - .5}
                       fill='none'
                       stroke={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                       strokeWidth={1}
               />;
    default:
        throw Error (`Unknown Circle Mode: ${image.mode}`);
    }
}

function render_rect (image, x, y) {
    let red = image.color.r;
    let green = image.color.g;
    let blue = image.color.b;
    let alpha = image.color.a / 255;

    switch (image.mode) {
    case 'solid':
        return <rect x={x}
                     y={y}
                     width={image.width}
                     height={image.height}
                     fill={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
               />;
    case 'outline':
        // stroke has similar problems here as it does in circle
        return <rect x={x + .5}
                     y={y + .5}
                     width={image.width - 1}
                     height={image.height - 1}
                     fill='none'
                     stroke={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                     strokeWidth={1}
               />;
    default:
        throw Error (`Unknown Rectangle Mode: ${image.mode}`);
    }
}

function render_triang (image, x, y) {
    throw Error (`Triangles not implemented yet`);
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

// these colors taken from https://github.com/brownplt/code.pyret.org/blob/horizon/src/web/js/trove/image-lib.js
const colorDB = [
    {name: "DARK-RED", color: makeColor(139, 0, 0)},
    {name: "FIRE-BRICK", color: makeColor(178, 34, 34)},
    {name: "DEEP-PINK", color: makeColor(255, 20, 147)},
    {name: "INDIAN-RED", color: makeColor(205, 92, 92)},
    {name: "MEDIUM-VIOLET-RED", color: makeColor(199, 21, 133)},
    {name: "VIOLET-RED", color: makeColor(208, 32, 144)},
    {name: "LIGHT-CORAL", color: makeColor(240, 128, 128)},
    {name: "HOT-PINK", color: makeColor(255, 105, 180)},
    {name: "PALE-VIOLET-RED", color: makeColor(219, 112, 147)},
    {name: "LIGHT-PINK", color: makeColor(255, 182, 193)},
    {name: "ROSY-BROWN", color: makeColor(188, 143, 143)},
    {name: "LAVENDER-BLUSH", color: makeColor(255, 240, 245)},
    {name: "SADDLE-BROWN", color: makeColor(139, 69, 19)},
    {name: "DARK-ORANGE", color: makeColor(255, 140, 0)},
    {name: "DARK-GOLDENRON", color: makeColor(184, 134, 11)},
    {name: "SANDY-BROWN", color: makeColor(244, 164, 96)},
    {name: "LIGHT-SALMON", color: makeColor(255, 160, 122)},
    {name: "DARK-SALMON", color: makeColor(233, 150, 122)},
    {name: "NAVAJO-WHITE", color: makeColor(255, 222, 173)},
    {name: "PEACH-PUFF", color: makeColor(255, 218, 185)},
    {name: "DARK-KHAKI", color: makeColor(189, 183, 107)},
    {name: "PALE-GOLDENROD", color: makeColor(238, 232, 170)},
    {name: "BLANCHE-DIAMOND", color: makeColor(255, 235, 205)},
    {name: "MEDIUM-GOLDENROD", color: makeColor(234, 234, 173)},
    {name: "PAPAYA-WHIP", color: makeColor(255, 239, 213)},
    {name: "MISTY-ROSE", color: makeColor(255, 228, 225)},
    {name: "LEMON-CHIFFON", color: makeColor(255, 250, 205)},
    {name: "ANTIQUE-WHITE", color: makeColor(250, 235, 215)},
    {name: "CORN-SILK", color: makeColor(255, 248, 220)},
    {name: "LIGHT-GOLDENRON-YELLOW", color: makeColor(250, 250, 210)},
    {name: "OLD-LACE", color: makeColor(253, 245, 230)},
    {name: "LIGHT-YELLOW", color: makeColor(255, 255, 224)},
    {name: "FLORAL-WHITE", color: makeColor(255, 250, 240)},
    {name: "LAWN-GREEN", color: makeColor(124, 252, 0)},
    {name: "GREEN-YELLOW", color: makeColor(173, 255, 47)},
    {name: "YELLOW-GREEN", color: makeColor(154, 205, 50)},
    {name: "MEDIUM-FOREST-GREEN", color: makeColor(107, 142, 35)},
    {name: "OLIVE-DRAB", color: makeColor(107, 142, 35)},
    {name: "MEDIUM-FOREST-GREEN", color: makeColor(107, 142, 35)},
    {name: "DARK-OLIVE-GREEN", color: makeColor(85, 107, 47)},
    {name: "DARK-SEA-GREEN", color: makeColor(143, 188, 139)},
    {name: "DARK-GREEN", color: makeColor(0, 100, 0)},
    {name: "LIME-GREEN", color: makeColor(50, 205, 50)},
    {name: "FOREST-GREEN", color: makeColor(34, 139, 34)},
    {name: "SPRING-GREEN", color: makeColor(0, 255, 127)},
    {name: "MEDIUM-SPRING-GREEN", color: makeColor(0, 250, 154)},
    {name: "SEA-GREEN", color: makeColor(46, 139, 87)},
    {name: "MEDIUM-SEA-GREEN", color: makeColor(60, 179, 113)},
    {name: "LIGHT-GREEN", color: makeColor(144, 238, 144)},
    {name: "PALE-GREEN", color: makeColor(152, 251, 152)},
    {name: "MEDIUM-AQUAMARINE", color: makeColor(102, 205, 170)},
    {name: "LIGHT-SEA-GREEN", color: makeColor(32, 178, 170)},
    {name: "MEDIUM-TURQUOISE", color: makeColor(72, 209, 204)},
    {name: "MINT-CREAM", color: makeColor(245, 255, 250)},
    {name: "ROYAL-BLUE", color: makeColor(65, 105, 225)},
    {name: "DODGER-BLUE", color: makeColor(30, 144, 255)},
    {name: "DEEP-SKY-BLUE", color: makeColor(0, 191, 255)},
    {name: "CORNFLOWER-BLUE", color: makeColor(100, 149, 237)},
    {name: "STEEL-BLUE", color: makeColor(70, 130, 180)},
    {name: "LIGHT-SKY-BLUE", color: makeColor(135, 206, 250)},
    {name: "DARK-TURQUOISE", color: makeColor(0, 206, 209)},
    {name: "DARKTURQUOISE", color: makeColor(0, 206, 209)},
    {name: "SKY-BLUE", color: makeColor(135, 206, 235)},
    {name: "SKYBLUE", color: makeColor(135, 206, 235)},
    {name: "CADET-BLUE", color: makeColor(96, 160, 160)},
    {name: "DARK-SLATE-GRAY", color: makeColor(47, 79, 79)},
    {name: "LIGHT-STEEL-BLUE", color: makeColor(176, 196, 222)},
    {name: "LIGHT-BLUE", color: makeColor(173, 216, 230)},
    {name: "POWDER-BLUE", color: makeColor(176, 224, 230)},
    {name: "PALE-TURQUOISE", color: makeColor(175, 238, 238)},
    {name: "LIGHT-CYAN", color: makeColor(224, 255, 255)},
    {name: "ALICE-BLUE", color: makeColor(240, 248, 255)},
    {name: "MEDIUM-BLUE", color: makeColor(0, 0, 205)},
    {name: "DARK-BLUE", color: makeColor(0, 0, 139)},
    {name: "MIDNIGHT-BLUE", color: makeColor(25, 25, 112)},
    {name: "BLUE-VIOLET", color: makeColor(138, 43, 226)},
    {name: "MEDIUM-SLATE-BLUE", color: makeColor(123, 104, 238)},
    {name: "SLATE-BLUE", color: makeColor(106, 90, 205)},
    {name: "DARK-SLATE-BLUE", color: makeColor(72, 61, 139)},
    {name: "DARK-VIOLET", color: makeColor(148, 0, 211)},
    {name: "DARK-ORCHID", color: makeColor(153, 50, 204)},
    {name: "MEDIUM-PURPLE", color: makeColor(147, 112, 219)},
    {name: "CORNFLOWER-BLUE", color: makeColor(68, 64, 108)},
    {name: "MEDIUM-ORCHID", color: makeColor(186, 85, 211)},
    {name: "DARK-MAGENTA", color: makeColor(139, 0, 139)},
    {name: "GHOST-WHITE", color: makeColor(248, 248, 255)},
    {name: "WHITE-SMOKE", color: makeColor(245, 245, 245)},
    {name: "LIGHT-GRAY", color: makeColor(211, 211, 211)},
    {name: "DARK-GRAY", color: makeColor(169, 169, 169)},
    {name: "DIM-GRAY", color: makeColor(105, 105, 105)},

    {name: "ORANGE", color: makeColor(255, 165, 0)},
    {name: "RED", color: makeColor(255, 0, 0)},
    {name: "ORANGERED", color: makeColor(255, 69, 0)},
    {name: "TOMATO", color: makeColor(255, 99, 71)},
    {name: "DARKRED", color: makeColor(139, 0, 0)},
    {name: "RED", color: makeColor(255, 0, 0)},
    {name: "FIREBRICK", color: makeColor(178, 34, 34)},
    {name: "CRIMSON", color: makeColor(220, 20, 60)},
    {name: "DEEPPINK", color: makeColor(255, 20, 147)},
    {name: "MAROON", color: makeColor(176, 48, 96)},
    {name: "INDIAN RED", color: makeColor(205, 92, 92)},
    {name: "INDIANRED", color: makeColor(205, 92, 92)},
    {name: "MEDIUM VIOLET RED", color: makeColor(199, 21, 133)},
    {name: "MEDIUMVIOLETRED", color: makeColor(199, 21, 133)},
    {name: "VIOLET RED", color: makeColor(208, 32, 144)},
    {name: "VIOLETRED", color: makeColor(208, 32, 144)},
    {name: "LIGHTCORAL", color: makeColor(240, 128, 128)},
    {name: "HOTPINK", color: makeColor(255, 105, 180)},
    {name: "PALEVIOLETRED", color: makeColor(219, 112, 147)},
    {name: "LIGHTPINK", color: makeColor(255, 182, 193)},
    {name: "ROSYBROWN", color: makeColor(188, 143, 143)},
    {name: "PINK", color: makeColor(255, 192, 203)},
    {name: "ORCHID", color: makeColor(218, 112, 214)},
    {name: "LAVENDERBLUSH", color: makeColor(255, 240, 245)},
    {name: "SNOW", color: makeColor(255, 250, 250)},
    {name: "CHOCOLATE", color: makeColor(210, 105, 30)},
    {name: "SADDLEBROWN", color: makeColor(139, 69, 19)},
    {name: "BROWN", color: makeColor(132, 60, 36)},
    {name: "DARKORANGE", color: makeColor(255, 140, 0)},
    {name: "CORAL", color: makeColor(255, 127, 80)},
    {name: "SIENNA", color: makeColor(160, 82, 45)},
    {name: "ORANGE", color: makeColor(255, 165, 0)},
    {name: "SALMON", color: makeColor(250, 128, 114)},
    {name: "PERU", color: makeColor(205, 133, 63)},
    {name: "DARKGOLDENROD", color: makeColor(184, 134, 11)},
    {name: "GOLDENROD", color: makeColor(218, 165, 32)},
    {name: "SANDYBROWN", color: makeColor(244, 164, 96)},
    {name: "LIGHTSALMON", color: makeColor(255, 160, 122)},
    {name: "DARKSALMON", color: makeColor(233, 150, 122)},
    {name: "GOLD", color: makeColor(255, 215, 0)},
    {name: "YELLOW", color: makeColor(255, 255, 0)},
    {name: "OLIVE", color: makeColor(128, 128, 0)},
    {name: "BURLYWOOD", color: makeColor(222, 184, 135)},
    {name: "TAN", color: makeColor(210, 180, 140)},
    {name: "NAVAJOWHITE", color: makeColor(255, 222, 173)},
    {name: "PEACHPUFF", color: makeColor(255, 218, 185)},
    {name: "KHAKI", color: makeColor(240, 230, 140)},
    {name: "DARKKHAKI", color: makeColor(189, 183, 107)},
    {name: "MOCCASIN", color: makeColor(255, 228, 181)},
    {name: "WHEAT", color: makeColor(245, 222, 179)},
    {name: "BISQUE", color: makeColor(255, 228, 196)},
    {name: "PALEGOLDENROD", color: makeColor(238, 232, 170)},
    {name: "BLANCHEDALMOND", color: makeColor(255, 235, 205)},
    {name: "MEDIUM GOLDENROD", color: makeColor(234, 234, 173)},
    {name: "MEDIUMGOLDENROD", color: makeColor(234, 234, 173)},
    {name: "PAPAYAWHIP", color: makeColor(255, 239, 213)},
    {name: "MISTYROSE", color: makeColor(255, 228, 225)},
    {name: "LEMONCHIFFON", color: makeColor(255, 250, 205)},
    {name: "ANTIQUEWHITE", color: makeColor(250, 235, 215)},
    {name: "CORNSILK", color: makeColor(255, 248, 220)},
    {name: "LIGHTGOLDENRODYELLOW", color: makeColor(250, 250, 210)},
    {name: "OLDLACE", color: makeColor(253, 245, 230)},
    {name: "LINEN", color: makeColor(250, 240, 230)},
    {name: "LIGHTYELLOW", color: makeColor(255, 255, 224)},
    {name: "SEASHELL", color: makeColor(255, 245, 238)},
    {name: "BEIGE", color: makeColor(245, 245, 220)},
    {name: "FLORALWHITE", color: makeColor(255, 250, 240)},
    {name: "IVORY", color: makeColor(255, 255, 240)},
    {name: "GREEN", color: makeColor(0, 255, 0)},
    {name: "LAWNGREEN", color: makeColor(124, 252, 0)},
    {name: "CHARTREUSE", color: makeColor(127, 255, 0)},
    {name: "GREEN YELLOW", color: makeColor(173, 255, 47)},
    {name: "GREENYELLOW", color: makeColor(173, 255, 47)},
    {name: "YELLOW GREEN", color: makeColor(154, 205, 50)},
    {name: "YELLOWGREEN", color: makeColor(154, 205, 50)},
    {name: "MEDIUM FOREST GREEN", color: makeColor(107, 142, 35)},
    {name: "OLIVEDRAB", color: makeColor(107, 142, 35)},
    {name: "MEDIUMFORESTGREEN", color: makeColor(107, 142, 35)},
    {name: "DARK OLIVE GREEN", color: makeColor(85, 107, 47)},
    {name: "DARKOLIVEGREEN", color: makeColor(85, 107, 47)},
    {name: "DARKSEAGREEN", color: makeColor(143, 188, 139)},
    {name: "LIME", color: makeColor(0, 255, 0)},
    {name: "DARK GREEN", color: makeColor(0, 100, 0)},
    {name: "DARKGREEN", color: makeColor(0, 100, 0)},
    {name: "LIME GREEN", color: makeColor(50, 205, 50)},
    {name: "LIMEGREEN", color: makeColor(50, 205, 50)},
    {name: "FOREST GREEN", color: makeColor(34, 139, 34)},
    {name: "FORESTGREEN", color: makeColor(34, 139, 34)},
    {name: "SPRING GREEN", color: makeColor(0, 255, 127)},
    {name: "SPRINGGREEN", color: makeColor(0, 255, 127)},
    {name: "MEDIUM SPRING GREEN", color: makeColor(0, 250, 154)},
    {name: "MEDIUMSPRINGGREEN", color: makeColor(0, 250, 154)},
    {name: "SEA GREEN", color: makeColor(46, 139, 87)},
    {name: "SEAGREEN", color: makeColor(46, 139, 87)},
    {name: "MEDIUM SEA GREEN", color: makeColor(60, 179, 113)},
    {name: "MEDIUMSEAGREEN", color: makeColor(60, 179, 113)},
    {name: "AQUAMARINE", color: makeColor(112, 216, 144)},
    {name: "LIGHTGREEN", color: makeColor(144, 238, 144)},
    {name: "PALE GREEN", color: makeColor(152, 251, 152)},
    {name: "PALEGREEN", color: makeColor(152, 251, 152)},
    {name: "MEDIUM AQUAMARINE", color: makeColor(102, 205, 170)},
    {name: "MEDIUMAQUAMARINE", color: makeColor(102, 205, 170)},
    {name: "TURQUOISE", color: makeColor(64, 224, 208)},
    {name: "LIGHTSEAGREEN", color: makeColor(32, 178, 170)},
    {name: "MEDIUM TURQUOISE", color: makeColor(72, 209, 204)},
    {name: "MEDIUMTURQUOISE", color: makeColor(72, 209, 204)},
    {name: "HONEYDEW", color: makeColor(240, 255, 240)},
    {name: "MINTCREAM", color: makeColor(245, 255, 250)},
    {name: "ROYALBLUE", color: makeColor(65, 105, 225)},
    {name: "DODGERBLUE", color: makeColor(30, 144, 255)},
    {name: "DEEPSKYBLUE", color: makeColor(0, 191, 255)},
    {name: "CORNFLOWERBLUE", color: makeColor(100, 149, 237)},
    {name: "STEEL BLUE", color: makeColor(70, 130, 180)},
    {name: "STEELBLUE", color: makeColor(70, 130, 180)},
    {name: "LIGHTSKYBLUE", color: makeColor(135, 206, 250)},
    {name: "DARK TURQUOISE", color: makeColor(0, 206, 209)},
    {name: "DARKTURQUOISE", color: makeColor(0, 206, 209)},
    {name: "CYAN", color: makeColor(0, 255, 255)},
    {name: "AQUA", color: makeColor(0, 255, 255)},
    {name: "DARKCYAN", color: makeColor(0, 139, 139)},
    {name: "TEAL", color: makeColor(0, 128, 128)},
    {name: "SKY BLUE", color: makeColor(135, 206, 235)},
    {name: "SKYBLUE", color: makeColor(135, 206, 235)},
    {name: "CADET BLUE", color: makeColor(96, 160, 160)},
    {name: "CADETBLUE", color: makeColor(95, 158, 160)},
    {name: "DARK SLATE GRAY", color: makeColor(47, 79, 79)},
    {name: "DARKSLATEGRAY", color: makeColor(47, 79, 79)},
    {name: "LIGHTSLATEGRAY", color: makeColor(119, 136, 153)},
    {name: "SLATEGRAY", color: makeColor(112, 128, 144)},
    {name: "LIGHT STEEL BLUE", color: makeColor(176, 196, 222)},
    {name: "LIGHTSTEELBLUE", color: makeColor(176, 196, 222)},
    {name: "LIGHT BLUE", color: makeColor(173, 216, 230)},
    {name: "LIGHTBLUE", color: makeColor(173, 216, 230)},
    {name: "POWDERBLUE", color: makeColor(176, 224, 230)},
    {name: "PALETURQUOISE", color: makeColor(175, 238, 238)},
    {name: "LIGHTCYAN", color: makeColor(224, 255, 255)},
    {name: "ALICEBLUE", color: makeColor(240, 248, 255)},
    {name: "AZURE", color: makeColor(240, 255, 255)},
    {name: "MEDIUM BLUE", color: makeColor(0, 0, 205)},
    {name: "MEDIUMBLUE", color: makeColor(0, 0, 205)},
    {name: "DARKBLUE", color: makeColor(0, 0, 139)},
    {name: "MIDNIGHT BLUE", color: makeColor(25, 25, 112)},
    {name: "MIDNIGHTBLUE", color: makeColor(25, 25, 112)},
    {name: "NAVY", color: makeColor(36, 36, 140)},
    {name: "BLUE", color: makeColor(0, 0, 255)},
    {name: "INDIGO", color: makeColor(75, 0, 130)},
    {name: "BLUE VIOLET", color: makeColor(138, 43, 226)},
    {name: "BLUEVIOLET", color: makeColor(138, 43, 226)},
    {name: "MEDIUM SLATE BLUE", color: makeColor(123, 104, 238)},
    {name: "MEDIUMSLATEBLUE", color: makeColor(123, 104, 238)},
    {name: "SLATE BLUE", color: makeColor(106, 90, 205)},
    {name: "SLATEBLUE", color: makeColor(106, 90, 205)},
    {name: "PURPLE", color: makeColor(160, 32, 240)},
    {name: "DARK SLATE BLUE", color: makeColor(72, 61, 139)},
    {name: "DARKSLATEBLUE", color: makeColor(72, 61, 139)},
    {name: "DARKVIOLET", color: makeColor(148, 0, 211)},
    {name: "DARK ORCHID", color: makeColor(153, 50, 204)},
    {name: "DARKORCHID", color: makeColor(153, 50, 204)},
    {name: "MEDIUMPURPLE", color: makeColor(147, 112, 219)},
    {name: "CORNFLOWER BLUE", color: makeColor(68, 64, 108)},
    {name: "MEDIUM ORCHID", color: makeColor(186, 85, 211)},
    {name: "MEDIUMORCHID", color: makeColor(186, 85, 211)},
    {name: "MAGENTA", color: makeColor(255, 0, 255)},
    {name: "FUCHSIA", color: makeColor(255, 0, 255)},
    {name: "DARKMAGENTA", color: makeColor(139, 0, 139)},
    {name: "VIOLET", color: makeColor(238, 130, 238)},
    {name: "PLUM", color: makeColor(221, 160, 221)},
    {name: "LAVENDER", color: makeColor(230, 230, 250)},
    {name: "THISTLE", color: makeColor(216, 191, 216)},
    {name: "GHOSTWHITE", color: makeColor(248, 248, 255)},
    {name: "WHITE", color: makeColor(255, 255, 255)},
    {name: "WHITESMOKE", color: makeColor(245, 245, 245)},
    {name: "GAINSBORO", color: makeColor(220, 220, 220)},
    {name: "LIGHT GRAY", color: makeColor(211, 211, 211)},
    {name: "LIGHTGRAY", color: makeColor(211, 211, 211)},
    {name: "SILVER", color: makeColor(192, 192, 192)},
    {name: "GRAY", color: makeColor(190, 190, 190)},
    {name: "DARK GRAY", color: makeColor(169, 169, 169)},
    {name: "DARKGRAY", color: makeColor(169, 169, 169)},
    {name: "DIM GRAY", color: makeColor(105, 105, 105)},
    {name: "DIMGRAY", color: makeColor(105, 105, 105)},
    {name: "BLACK", color: makeColor(0, 0, 0)},
    {name: "TRANSPARENT", color: makeColor(0, 0, 0, 0)},
];
