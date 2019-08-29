/*******************************************
    This here is the image library in js
*******************************************/


/***
    Data Definitions:
An Image is one of 
      - Circle
      - Rectangle
      - Triangle
      - Polygon
      - Beside
      - Above
      - Overlay
      - Place

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
      {A:      Integer,             /\
       B:      Integer,            /  \
       C:      Integer,        B  /    \  C
       color:  Color,            /      \
       mode:   String,          /________\
       type:   'triangle'}          A      
       
    A Polygon is
      {coordinates: [{x: Integer, y: Integer}],
       color:       Color,
       mode:        String,
       type:        'polygon'}
       
    note: only acute triangles are handled
       
    A Beside is
      {type:   'beside',
       yplace:  String,
       images: [Image]} note: images must be non-empty
       
    An Above is
      {type:   'above',
       xplace:  String,
       images: [Image]} note: images must be non-empty

    An Overlay is
      {type:   'overlay',
       yplace: String
       xplace: String,
       images: [Image]} note: images must be non-empty
       
   A Place is
     {type: place,
      x:     Integer,
      y:     Integer,
      image: Image,
      scene: Image}
       
    A Color is
      {r: Integer,
       g: Integer,
       b: Integer,
       a: Integer}
***/

import React from 'react';

// these colors taken from https://github.com/brownplt/code.pyret.org/blob/horizon/src/web/js/trove/image-lib.js
const colorDb = {
    "DARK-RED" : makeColor(139, 0, 0),
    "FIRE-BRICK" : makeColor(178, 34, 34),
    "DEEP-PINK" : makeColor(255, 20, 147),
    "INDIAN-RED" : makeColor(205, 92, 92),
    "MEDIUM-VIOLET-RED" : makeColor(199, 21, 133),
    "VIOLET-RED" : makeColor(208, 32, 144),
    "LIGHT-CORAL" : makeColor(240, 128, 128),
    "HOT-PINK" : makeColor(255, 105, 180),
    "PALE-VIOLET-RED" : makeColor(219, 112, 147),
    "LIGHT-PINK" : makeColor(255, 182, 193),
    "ROSY-BROWN" : makeColor(188, 143, 143),
    "LAVENDER-BLUSH" : makeColor(255, 240, 245),
    "SADDLE-BROWN" : makeColor(139, 69, 19),
    "DARK-ORANGE" : makeColor(255, 140, 0),
    "DARK-GOLDENRON" : makeColor(184, 134, 11),
    "SANDY-BROWN" : makeColor(244, 164, 96),
    "LIGHT-SALMON" : makeColor(255, 160, 122),
    "DARK-SALMON" : makeColor(233, 150, 122),
    "NAVAJO-WHITE" : makeColor(255, 222, 173),
    "PEACH-PUFF" : makeColor(255, 218, 185),
    "DARK-KHAKI" : makeColor(189, 183, 107),
    "PALE-GOLDENROD" : makeColor(238, 232, 170),
    "BLANCHE-DIAMOND" : makeColor(255, 235, 205),
    "MEDIUM-GOLDENROD" : makeColor(234, 234, 173),
    "PAPAYA-WHIP" : makeColor(255, 239, 213),
    "MISTY-ROSE" : makeColor(255, 228, 225),
    "LEMON-CHIFFON" : makeColor(255, 250, 205),
    "ANTIQUE-WHITE" : makeColor(250, 235, 215),
    "CORN-SILK" : makeColor(255, 248, 220),
    "LIGHT-GOLDENRON-YELLOW" : makeColor(250, 250, 210),
    "OLD-LACE" : makeColor(253, 245, 230),
    "LIGHT-YELLOW" : makeColor(255, 255, 224),
    "FLORAL-WHITE" : makeColor(255, 250, 240),
    "LAWN-GREEN" : makeColor(124, 252, 0),
    "GREEN-YELLOW" : makeColor(173, 255, 47),
    "YELLOW-GREEN" : makeColor(154, 205, 50),
    "OLIVE-DRAB" : makeColor(107, 142, 35),
    "MEDIUM-FOREST-GREEN" : makeColor(107, 142, 35),
    "DARK-OLIVE-GREEN" : makeColor(85, 107, 47),
    "DARK-SEA-GREEN" : makeColor(143, 188, 139),
    "DARK-GREEN" : makeColor(0, 100, 0),
    "LIME-GREEN" : makeColor(50, 205, 50),
    "FOREST-GREEN" : makeColor(34, 139, 34),
    "SPRING-GREEN" : makeColor(0, 255, 127),
    "MEDIUM-SPRING-GREEN" : makeColor(0, 250, 154),
    "SEA-GREEN" : makeColor(46, 139, 87),
    "MEDIUM-SEA-GREEN" : makeColor(60, 179, 113),
    "LIGHT-GREEN" : makeColor(144, 238, 144),
    "PALE-GREEN" : makeColor(152, 251, 152),
    "MEDIUM-AQUAMARINE" : makeColor(102, 205, 170),
    "LIGHT-SEA-GREEN" : makeColor(32, 178, 170),
    "MEDIUM-TURQUOISE" : makeColor(72, 209, 204),
    "MINT-CREAM" : makeColor(245, 255, 250),
    "ROYAL-BLUE" : makeColor(65, 105, 225),
    "DODGER-BLUE" : makeColor(30, 144, 255),
    "DEEP-SKY-BLUE" : makeColor(0, 191, 255),
    "CORNFLOWER-BLUE" : makeColor(100, 149, 237),
    "STEEL-BLUE" : makeColor(70, 130, 180),
    "LIGHT-SKY-BLUE" : makeColor(135, 206, 250),
    "DARK-TURQUOISE" : makeColor(0, 206, 209),
    "DARKTURQUOISE" : makeColor(0, 206, 209),
    "SKY-BLUE" : makeColor(135, 206, 235),
    "SKYBLUE" : makeColor(135, 206, 235),
    "CADET-BLUE" : makeColor(96, 160, 160),
    "DARK-SLATE-GRAY" : makeColor(47, 79, 79),
    "LIGHT-STEEL-BLUE" : makeColor(176, 196, 222),
    "LIGHT-BLUE" : makeColor(173, 216, 230),
    "POWDER-BLUE" : makeColor(176, 224, 230),
    "PALE-TURQUOISE" : makeColor(175, 238, 238),
    "LIGHT-CYAN" : makeColor(224, 255, 255),
    "ALICE-BLUE" : makeColor(240, 248, 255),
    "MEDIUM-BLUE" : makeColor(0, 0, 205),
    "DARK-BLUE" : makeColor(0, 0, 139),
    "MIDNIGHT-BLUE" : makeColor(25, 25, 112),
    "BLUE-VIOLET" : makeColor(138, 43, 226),
    "MEDIUM-SLATE-BLUE" : makeColor(123, 104, 238),
    "SLATE-BLUE" : makeColor(106, 90, 205),
    "DARK-SLATE-BLUE" : makeColor(72, 61, 139),
    "DARK-VIOLET" : makeColor(148, 0, 211),
    "DARK-ORCHID" : makeColor(153, 50, 204),
    "MEDIUM-PURPLE" : makeColor(147, 112, 219),
    "MEDIUM-ORCHID" : makeColor(186, 85, 211),
    "DARK-MAGENTA" : makeColor(139, 0, 139),
    "GHOST-WHITE" : makeColor(248, 248, 255),
    "WHITE-SMOKE" : makeColor(245, 245, 245),
    "LIGHT-GRAY" : makeColor(211, 211, 211),
    "DARK-GRAY" : makeColor(169, 169, 169),
    "DIM-GRAY" : makeColor(105, 105, 105),

    "ORANGE" : makeColor(255, 165, 0),
    "ORANGERED" : makeColor(255, 69, 0),
    "TOMATO" : makeColor(255, 99, 71),
    "DARKRED" : makeColor(139, 0, 0),
    "RED" : makeColor(255, 0, 0),
    "FIREBRICK" : makeColor(178, 34, 34),
    "CRIMSON" : makeColor(220, 20, 60),
    "DEEPPINK" : makeColor(255, 20, 147),
    "MAROON" : makeColor(176, 48, 96),
    "INDIAN RED" : makeColor(205, 92, 92),
    "INDIANRED" : makeColor(205, 92, 92),
    "MEDIUM VIOLET RED" : makeColor(199, 21, 133),
    "MEDIUMVIOLETRED" : makeColor(199, 21, 133),
    "VIOLET RED" : makeColor(208, 32, 144),
    "VIOLETRED" : makeColor(208, 32, 144),
    "LIGHTCORAL" : makeColor(240, 128, 128),
    "HOTPINK" : makeColor(255, 105, 180),
    "PALEVIOLETRED" : makeColor(219, 112, 147),
    "LIGHTPINK" : makeColor(255, 182, 193),
    "ROSYBROWN" : makeColor(188, 143, 143),
    "PINK" : makeColor(255, 192, 203),
    "ORCHID" : makeColor(218, 112, 214),
    "LAVENDERBLUSH" : makeColor(255, 240, 245),
    "SNOW" : makeColor(255, 250, 250),
    "CHOCOLATE" : makeColor(210, 105, 30),
    "SADDLEBROWN" : makeColor(139, 69, 19),
    "BROWN" : makeColor(132, 60, 36),
    "DARKORANGE" : makeColor(255, 140, 0),
    "CORAL" : makeColor(255, 127, 80),
    "SIENNA" : makeColor(160, 82, 45),
    "SALMON" : makeColor(250, 128, 114),
    "PERU" : makeColor(205, 133, 63),
    "DARKGOLDENROD" : makeColor(184, 134, 11),
    "GOLDENROD" : makeColor(218, 165, 32),
    "SANDYBROWN" : makeColor(244, 164, 96),
    "LIGHTSALMON" : makeColor(255, 160, 122),
    "DARKSALMON" : makeColor(233, 150, 122),
    "GOLD" : makeColor(255, 215, 0),
    "YELLOW" : makeColor(255, 255, 0),
    "OLIVE" : makeColor(128, 128, 0),
    "BURLYWOOD" : makeColor(222, 184, 135),
    "TAN" : makeColor(210, 180, 140),
    "NAVAJOWHITE" : makeColor(255, 222, 173),
    "PEACHPUFF" : makeColor(255, 218, 185),
    "KHAKI" : makeColor(240, 230, 140),
    "DARKKHAKI" : makeColor(189, 183, 107),
    "MOCCASIN" : makeColor(255, 228, 181),
    "WHEAT" : makeColor(245, 222, 179),
    "BISQUE" : makeColor(255, 228, 196),
    "PALEGOLDENROD" : makeColor(238, 232, 170),
    "BLANCHEDALMOND" : makeColor(255, 235, 205),
    "MEDIUM GOLDENROD" : makeColor(234, 234, 173),
    "MEDIUMGOLDENROD" : makeColor(234, 234, 173),
    "PAPAYAWHIP" : makeColor(255, 239, 213),
    "MISTYROSE" : makeColor(255, 228, 225),
    "LEMONCHIFFON" : makeColor(255, 250, 205),
    "ANTIQUEWHITE" : makeColor(250, 235, 215),
    "CORNSILK" : makeColor(255, 248, 220),
    "LIGHTGOLDENRODYELLOW" : makeColor(250, 250, 210),
    "OLDLACE" : makeColor(253, 245, 230),
    "LINEN" : makeColor(250, 240, 230),
    "LIGHTYELLOW" : makeColor(255, 255, 224),
    "SEASHELL" : makeColor(255, 245, 238),
    "BEIGE" : makeColor(245, 245, 220),
    "FLORALWHITE" : makeColor(255, 250, 240),
    "IVORY" : makeColor(255, 255, 240),
    "GREEN" : makeColor(0, 255, 0),
    "LAWNGREEN" : makeColor(124, 252, 0),
    "CHARTREUSE" : makeColor(127, 255, 0),
    "GREEN YELLOW" : makeColor(173, 255, 47),
    "GREENYELLOW" : makeColor(173, 255, 47),
    "YELLOW GREEN" : makeColor(154, 205, 50),
    "YELLOWGREEN" : makeColor(154, 205, 50),
    "MEDIUM FOREST GREEN" : makeColor(107, 142, 35),
    "OLIVEDRAB" : makeColor(107, 142, 35),
    "MEDIUMFORESTGREEN" : makeColor(107, 142, 35),
    "DARK OLIVE GREEN" : makeColor(85, 107, 47),
    "DARKOLIVEGREEN" : makeColor(85, 107, 47),
    "DARKSEAGREEN" : makeColor(143, 188, 139),
    "LIME" : makeColor(0, 255, 0),
    "DARK GREEN" : makeColor(0, 100, 0),
    "DARKGREEN" : makeColor(0, 100, 0),
    "LIME GREEN" : makeColor(50, 205, 50),
    "LIMEGREEN" : makeColor(50, 205, 50),
    "FOREST GREEN" : makeColor(34, 139, 34),
    "FORESTGREEN" : makeColor(34, 139, 34),
    "SPRING GREEN" : makeColor(0, 255, 127),
    "SPRINGGREEN" : makeColor(0, 255, 127),
    "MEDIUM SPRING GREEN" : makeColor(0, 250, 154),
    "MEDIUMSPRINGGREEN" : makeColor(0, 250, 154),
    "SEA GREEN" : makeColor(46, 139, 87),
    "SEAGREEN" : makeColor(46, 139, 87),
    "MEDIUM SEA GREEN" : makeColor(60, 179, 113),
    "MEDIUMSEAGREEN" : makeColor(60, 179, 113),
    "AQUAMARINE" : makeColor(112, 216, 144),
    "LIGHTGREEN" : makeColor(144, 238, 144),
    "PALE GREEN" : makeColor(152, 251, 152),
    "PALEGREEN" : makeColor(152, 251, 152),
    "MEDIUM AQUAMARINE" : makeColor(102, 205, 170),
    "MEDIUMAQUAMARINE" : makeColor(102, 205, 170),
    "TURQUOISE" : makeColor(64, 224, 208),
    "LIGHTSEAGREEN" : makeColor(32, 178, 170),
    "MEDIUM TURQUOISE" : makeColor(72, 209, 204),
    "MEDIUMTURQUOISE" : makeColor(72, 209, 204),
    "HONEYDEW" : makeColor(240, 255, 240),
    "MINTCREAM" : makeColor(245, 255, 250),
    "ROYALBLUE" : makeColor(65, 105, 225),
    "DODGERBLUE" : makeColor(30, 144, 255),
    "DEEPSKYBLUE" : makeColor(0, 191, 255),
    "CORNFLOWERBLUE" : makeColor(100, 149, 237),
    "STEEL BLUE" : makeColor(70, 130, 180),
    "STEELBLUE" : makeColor(70, 130, 180),
    "LIGHTSKYBLUE" : makeColor(135, 206, 250),
    "DARK TURQUOISE" : makeColor(0, 206, 209),
    "CYAN" : makeColor(0, 255, 255),
    "AQUA" : makeColor(0, 255, 255),
    "DARKCYAN" : makeColor(0, 139, 139),
    "TEAL" : makeColor(0, 128, 128),
    "SKY BLUE" : makeColor(135, 206, 235),
    "CADET BLUE" : makeColor(96, 160, 160),
    "CADETBLUE" : makeColor(95, 158, 160),
    "DARK SLATE GRAY" : makeColor(47, 79, 79),
    "DARKSLATEGRAY" : makeColor(47, 79, 79),
    "LIGHTSLATEGRAY" : makeColor(119, 136, 153),
    "SLATEGRAY" : makeColor(112, 128, 144),
    "LIGHT STEEL BLUE" : makeColor(176, 196, 222),
    "LIGHTSTEELBLUE" : makeColor(176, 196, 222),
    "LIGHT BLUE" : makeColor(173, 216, 230),
    "LIGHTBLUE" : makeColor(173, 216, 230),
    "POWDERBLUE" : makeColor(176, 224, 230),
    "PALETURQUOISE" : makeColor(175, 238, 238),
    "LIGHTCYAN" : makeColor(224, 255, 255),
    "ALICEBLUE" : makeColor(240, 248, 255),
    "AZURE" : makeColor(240, 255, 255),
    "MEDIUM BLUE" : makeColor(0, 0, 205),
    "MEDIUMBLUE" : makeColor(0, 0, 205),
    "DARKBLUE" : makeColor(0, 0, 139),
    "MIDNIGHT BLUE" : makeColor(25, 25, 112),
    "MIDNIGHTBLUE" : makeColor(25, 25, 112),
    "NAVY" : makeColor(36, 36, 140),
    "BLUE" : makeColor(0, 0, 255),
    "INDIGO" : makeColor(75, 0, 130),
    "BLUE VIOLET" : makeColor(138, 43, 226),
    "BLUEVIOLET" : makeColor(138, 43, 226),
    "MEDIUM SLATE BLUE" : makeColor(123, 104, 238),
    "MEDIUMSLATEBLUE" : makeColor(123, 104, 238),
    "SLATE BLUE" : makeColor(106, 90, 205),
    "SLATEBLUE" : makeColor(106, 90, 205),
    "PURPLE" : makeColor(160, 32, 240),
    "DARK SLATE BLUE" : makeColor(72, 61, 139),
    "DARKSLATEBLUE" : makeColor(72, 61, 139),
    "DARKVIOLET" : makeColor(148, 0, 211),
    "DARK ORCHID" : makeColor(153, 50, 204),
    "DARKORCHID" : makeColor(153, 50, 204),
    "MEDIUMPURPLE" : makeColor(147, 112, 219),
    "CORNFLOWER BLUE" : makeColor(68, 64, 108),
    "MEDIUM ORCHID" : makeColor(186, 85, 211),
    "MEDIUMORCHID" : makeColor(186, 85, 211),
    "MAGENTA" : makeColor(255, 0, 255),
    "FUCHSIA" : makeColor(255, 0, 255),
    "DARKMAGENTA" : makeColor(139, 0, 139),
    "VIOLET" : makeColor(238, 130, 238),
    "PLUM" : makeColor(221, 160, 221),
    "LAVENDER" : makeColor(230, 230, 250),
    "THISTLE" : makeColor(216, 191, 216),
    "GHOSTWHITE" : makeColor(248, 248, 255),
    "WHITE" : makeColor(255, 255, 255),
    "WHITESMOKE" : makeColor(245, 245, 245),
    "GAINSBORO" : makeColor(220, 220, 220),
    "LIGHT GRAY" : makeColor(211, 211, 211),
    "LIGHTGRAY" : makeColor(211, 211, 211),
    "SILVER" : makeColor(192, 192, 192),
    "GRAY" : makeColor(190, 190, 190),
    "DARK GRAY" : makeColor(169, 169, 169),
    "DARKGRAY" : makeColor(169, 169, 169),
    "DIM GRAY" : makeColor(105, 105, 105),
    "DIMGRAY" : makeColor(105, 105, 105),
    "BLACK" : makeColor(0, 0, 0),
    "TRANSPARENT" : makeColor(0, 0, 0, 0),
};

// Integer
// generates a random key so react stops complaining
function genKey() {
    return Math.round(Math.random() * 100000000);
}

/*
TODO:
  Figure out how triangles should work
*/

// Integer, Integer, Integer[, Integer] -> Color 
function makeColor (r, g, b, a = 255) {
    if (r < 0 || r > 255 ||
        g < 0 || g > 255 ||
        b < 0 || b > 255 ||
        a < 0 || a > 255 ){
        throw new Error('r g b a values must be between 0 and 255 (inclusive)');
    }

    return {r, g, b, a};
}

// Color, Integer -> Color
function changeAlpha (color, a) {
    return makeColor(color.r, color.g, color.b, a);
}

// Integer -> Integer
// pretty much makes sure the argument is non-negative
function checkDimension(maybeDimension) {
    if (maybeDimension < 0) {
        throw new Error('shape dimensions must be non-negative');
    }

    return maybeDimension;
}

// (String or Color) -> Color
function checkColor(maybeColor) {
    if (typeof maybeColor === 'string') {
        let color = colorDb[maybeColor.replace(' ', '').toUpperCase()];
        if (color === undefined) {
            throw new Error(`${maybeColor} is not a valid color`);
        }

        return color;
    } 

    // TODO: check if maybeColor is actually a color object
    return maybeColor;
}

function checkMode(maybeMode) {
    if (maybeMode !== 'solid' && maybeMode !== 'outline') {
        throw new Error(`${maybeMode} is not a valid mode`);
    }

    return maybeMode;
}

function checkXPlace(maybeXPlace) {
    if (maybeXPlace === 'middle') {
        return 'center';
    }

    if (maybeXPlace !== 'left' && maybeXPlace !== 'right' && maybeXPlace !== 'center') {
        throw new Error(`${maybeXPlace} is not a valid x-place`);
    }

    return maybeXPlace;
}

function checkYPlace(maybeYPlace) {
    if (maybeYPlace === 'middle') {
        return 'center';
    }

    if (maybeYPlace !== 'top' && maybeYPlace !== 'bottom' && maybeYPlace !== 'center') {
        throw new Error(`${maybeYPlace} is not a valid y-place`);
    }

    return maybeYPlace;
}

// Integer (String or Integer) Color -> Circle
function makeCircle (r, mode, color) {
    if (typeof mode === 'string') {
        return {r: checkDimension(r), mode: checkMode(mode), color: checkColor(color), type: 'circle'};
    } else {
        return {r: checkDimension(r), mode: 'solid', color: changeAlpha(checkColor(color), mode), type: 'circle'};
    }
}

// Integer Integer (String or Integer) Color -> Rectangle
function makeRectangle (width, height, mode, color) {
    if (typeof mode === 'string') {
        return {width: checkDimension(width), height: checkDimension(height), mode: checkMode(mode),  color: checkColor(color), type: 'rect'};
    } else {
        return {width: checkDimension(width), height: checkDimension(height), mode: 'solid',  color: changeAlpha(checkColor(color), mode), type: 'rect'};
    }
}

// Integer Integer Integer (String or Integer) Color -> Triangle
function makeTriangle (A, B, C, mode, color) {
    if (typeof mode === 'string') {
        return {A: checkDimension(A), B: checkDimension(B), C: checkDimension(C), mode: checkMode(mode), color: checkColor(color), type: 'triangle'};
    } else {
        return {A: checkDimension(A), B: checkDimension(B), C: checkDimension(C), mode: 'solid', color: changeAlpha(checkColor(color), mode), type: 'triangle'};
    }
}

// Integer (String or Integer) Color -> Triangle
function makeEquiTriangle (length, mode, color) {
    return makeTriangle(length, length, length, mode, color);
}

// [{x: Integer, y: Integer}], (String or Integer), Color -> Polygon
function makePolygon (coords, mode, color) {
    if (typeof mode === 'string') {
        return {coordinates: coords, mode: checkMode(mode), color: checkColor(color), type: 'polygon'};
    } else {
        return {coordinates: coords, mode: 'solid', color: changeAlpha(checkColor(color), mode), type: 'polygon'};
    }
}

// Integer, (String or Integer), Color -> Polygon
function makePentagon (length, mode, color) {
}

// Integer, (String or Integer), Color -> Polygon
function makeHexagon (length, mode, color) {
}

// Integer, (String or Integer), Color -> Polygon
function makeStar (length, mode, color) {
}

// [Image] -> Image
function makeBeside (images, yplace = 'center') {
    return {images, yplace: checkYPlace(yplace), type: 'beside'};
}

// [Image] -> Image
function makeAbove (images, xplace = 'center') {
    return {images, xplace: checkXPlace(xplace), type: 'above'};
}

// [Image] -> Image
function makeOverlay (images, xplace = 'center', yplace = 'center') {
    return {images, xplace: checkXPlace(xplace), yplace: checkYPlace(yplace), type: 'overlay'};
}

function makePlace (image, x, y, scene) {
    return {image, x, y, scene, type: 'place'};
}

let circle = makeCircle;
let rectangle = makeRectangle;
let triangle = makeEquiTriangle;
let beside = makeBeside;
let above = makeAbove;
let overlay = makeOverlay;
let placeImage = makePlace;

// Image -> Integer
function width (image) {
    switch (image.type) {
    case 'circle':
        return image.r * 2;
    case 'rect':
        return image.width;
    case 'triangle':
        return image.A;
    case 'polygon':
        return image.coordinates.map((coord) => coord.x).reduce((acc, x) => Math.max(acc, x));
    case 'beside':
        return image.images.reduce((acc, image) => acc + width(image), 0);
    case 'above':
        return image.images.reduce((acc, image) => Math.max(acc, width(image)), 0);
    case 'overlay':
        return image.images.reduce((acc, image) => Math.max(acc, width(image)), 0);
    case 'place':
        return width(image.scene);
    default:
        return new Error (`Unknown Image Type: ${image.type}`);
    }
}

// Image -> Integer
function height (image) {
    switch (image.type) {
    case 'circle':
        return image.r * 2;
    case 'rect':
        return image.height;
    case 'triangle':
        // Heron's Formula, I went on Wikihow for this, don't judge
        let s = (image.A + image.B + image.C) / 2;
        let area = Math.sqrt(s * (s  - image.A) * (s - image.B) * (s - image.C));
        return Math.round((area * 2) / image.A);
    case 'polygon':
        return image.coordinates.map((coord) => coord.y).reduce((acc, y) => Math.max(acc, y));
    case 'beside':
        return image.images.reduce((acc, image) => Math.max(acc, height(image)), 0);
    case 'above':
        return image.images.reduce((acc, image) => acc + height(image), 0);
    case 'overlay':
        return image.images.reduce((acc, image) => Math.max(acc, height(image)), 0);
    case 'place':
        return height(image.scene);
    default:
        return new Error (`Unknown Image Type: ${image.type}`);
    }
}


// Image Integer Integer -> SVG
function render (image, x, y) {
    switch (image.type) {
    case 'circle':
        return render_circle(image, x, y);
    case 'rect':
        return render_rect(image, x, y);
    case 'triangle':
        return render_triangle(image, x, y);
    case 'polygon':
        return render_polygon(image, x, y);
    case 'beside':
        return render_beside(image, x, y);
    case 'above':
        return render_above(image, x, y);
    case 'overlay':
        return render_overlay(image, x, y);
    case 'place':
        return render_place(image, x, y);
    default:
        throw new Error (`Unknown Image Type: ${image.type}`);
    }
}

// Image Integer Integer -> SVG
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
                       key={genKey()}
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
                       key={genKey()}
               />;
    default:
        throw new Error (`Unknown Image Mode: ${image.mode}`);
    }
}

// Image Integer Integer -> SVG
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
                     key={genKey()}
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
                      key={genKey()}
                 />;
    default:
        throw new Error (`Unknown Image Mode: ${image.mode}`);
    }
}

// Image Integer Integer -> SVG
function render_triangle (image, x, y) {
    let red = image.color.r;
    let green = image.color.g;
    let blue = image.color.b;
    let alpha = image.color.a / 255;

    let D = Math.round(Math.sqrt(Math.pow(image.B, 2) - Math.pow(height(image), 2))); 
    // these are coordinates                                   //         b       
    let a = {x: x, y: y + height(image)};                      //         .       
    let b = {x: x + D, y: y};                                  //        /|\      
    let c = {x: x + width(image), y: y + height(image)};       //       / | \     
                                                               //   B  /  |  \  C
                                                               //     /   |h  \
                                                               //    /    |    \
                                                               //   ._____|_____.
                                                               //  a   D  A      c
    switch (image.mode) {                                       
    case 'solid':                                               
        return <polygon
                 points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
                 fill={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                 key={genKey()}
               />;
    case 'outline':
        return <polygon
                 points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
                 fill='none'
                 stroke={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                 strokeWidth={1}
                 key={genKey()}
               />;
    default:
        throw new Error (`Unknown Image Mode: ${image.mode}`);
    }
}

function render_polygon (image, x, y) {
    let red = image.color.r;
    let green = image.color.g;
    let blue = image.color.b;
    let alpha = image.color.a / 255;

    let points = image.coordinates.map((coord) => `${coord.x + x},${coord.y + y}`).reduce((acc, cur) => acc + ' ' + cur);
    switch (image.mode) {
    case 'solid':                                               
        return <polygon
                 points={points}
                 fill={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                 key={genKey()}
               />;
    case 'outline':
        return <polygon
                 points={points}
                 fill='none'
                 stroke={`rgba(${red}, ${green}, ${blue}, ${alpha})`}
                 strokeWidth={1}
                 key={genKey()}
               />;
    default:
        throw new Error (`Unknown Image Mode: ${image.mode}`);
    }
}


// should I flatten [SVG]s?
// no

// (Integer, Integer -> Integer), (Integer, Integer -> Integer), (Integer, Integer -> Integer), (Integer, Integer -> Integer) -> ([Image], Integer, Integer) -> [SVG]
function make_list_renderer (xCorrect, yCorrect, xChange, yChange) {
    function render_list (images, x, y) {
        if (images.length === 0) {
            throw new Error('I need at least 1 image to render!');
        }

        let w = width(images[0]);
        let h = height(images[0]);

        let first = render(images[0], xCorrect(x, w), yCorrect(y, h));

        if (images.length === 1) {
            return [first];
        }

        let rest = render_list(images.slice(1), xChange(x, w), yChange(y, h));

        // return list in reverse because the last child of an svg tag is shown on top
        // this matters for overlay, but makes no difference in beside, above
        return [...rest, first];
    }

    return render_list;
}

// Image Integer Integer -> [SVG]
function render_beside (image, x, y) {
    let initY = y,
        yCorrect = (y, h) => y;

    switch(image.yplace) {
    case 'top':
        break;
    case 'center':
        initY = y + height(image) / 2;
        yCorrect = (y, h) => y - h/2;
        break;
    case 'bottom':
        initY = y + height(image);
        yCorrect = (y, h) => y - h;
        break;
    default:
        throw new Error(`Unknown y-place: ${image.yplace}`);
    }

    let renderoozle = make_list_renderer((x, w) => x,
                                         yCorrect,
                                         (x, dx) => x + dx,
                                         (y, dy) => y);
    return renderoozle(image.images, x, initY);
}

// Image Integer Integer -> [SVG]
function render_above (image, x, y) {
    let initX = x,
        xCorrect = (x, w) => x;

    switch(image.xplace) {
    case 'left':
        break;
    case 'center':
        initX = x + width(image) / 2;
        xCorrect = (x, w) => x - w/2;
        break;
    case 'right':
        initX = x + width(image);
        xCorrect = (x, w) => x - w;
        break;
    default:
        throw new Error(`Unknown x-place: ${image.xplace}`);
    }

    let renderoozle = make_list_renderer(xCorrect,
                                         (y, h) => y,
                                         (x, dx) => x,
                                         (y, dy) => y + dy);
    return renderoozle(image.images, initX, y);

}

function render_overlay (image, x, y) {
    let initX = x,
        initY = y,
        xCorrect = (x, w) => x,
        yCorrect = (y, h) => y;
    
    switch(image.xplace) {
    case 'left':
        break;
    case 'center':
        initX = x + width(image) / 2;
        xCorrect = (x, w) => x - w/2;
        break;
    case 'right':
        initX = x + width(image);
        xCorrect = (x, w) => x - w;
        break;
    default:
        throw new Error(`Unknown x-place: ${image.xplace}`);
    }

    switch(image.yplace) {
    case 'top':
        break;
    case 'center':
        initY = y + height(image) / 2;
        yCorrect = (y, h) => y - h/2;
        break;
    case 'bottom':
        initY = y + height(image);
        yCorrect = (y, h) => y - h;
        break;
    default:
        throw new Error(`Unknown y-place: ${image.yplace}`);
    }

    let renderoozle = make_list_renderer(xCorrect,
                                         yCorrect,
                                         (x, dx) => x,
                                         (y, dy) => y);
    return renderoozle(image.images, initX, initY);
}

function render_place (image, x, y) {
    return [render(image.scene, x, y), render(image.image, image.x - width(image.image) / 2, image.y - height(image.image) / 2)];
}

function emptyScene (w, h, color = 'white') {
    return overlay([rectangle(w, h, 'outline', 'black'), rectangle(w, h, 'solid', color)]);
}

// Image -> top level SVG
function paint (image) {
    let picture = render(image, 0, 0);
    return (
        <svg viewBox={`0 0 ${width(image)} ${height(image)}`}
             xmlns='http://www.w3.org/2000/svg'
             width={width(image)}
             height={height(image)}
        >
          {picture}
        </svg>
    );
}

//export paint;
export {makeCircle, makeRectangle, makeEquiTriangle,
        makeBeside, makeAbove, makeOverlay,
        makePlace, emptyScene, makeColor,
        paint};
