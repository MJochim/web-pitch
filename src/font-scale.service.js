// Adapted from EMU-webApp

export class FontScaleService {

    // public static getScaleY(ctx: CanvasRenderingContext2D): number {
    static getScaleY(ctx) {
        return ctx.canvas.height / ctx.canvas.offsetHeight;
    }

    //public static getScaleX(ctx: CanvasRenderingContext2D): number {
    static getScaleX(ctx) {
        return ctx.canvas.width / ctx.canvas.offsetWidth;
    }

    static drawUndistortedText(context, //: CanvasRenderingContext2D,
                                      text, //: string,
                                      fontPxSize, //: number,
                                      fontType, //: string,
                                      x, //: number,
                                      y, //: number,
                                      color, //: string,
                                      horizontalAnchor, //: 'left' | 'center' | 'right',
                                      verticalAnchor) { //: 'top' | 'middle' | 'bottom') {
        context.save();

        context.scale(FontScaleService.getScaleX(context), FontScaleService.getScaleY(context));
        context.font = (fontPxSize + 'px' + ' ' + fontType);
        context.fillStyle = color;

        let finalX;
        let finalY;

        if (horizontalAnchor === 'left') {
            finalX = x / FontScaleService.getScaleX(context);
        } else if (horizontalAnchor === 'right') {
            finalX = x / FontScaleService.getScaleX(context) - context.measureText(text).width;
        } else if (horizontalAnchor === 'center') {
            finalX = x / FontScaleService.getScaleX(context) - context.measureText(text).width / 2;
        }

        if (verticalAnchor === 'bottom') {
            finalY = y / FontScaleService.getScaleY(context);
        } else if (verticalAnchor === 'top') {
            finalY = y / FontScaleService.getScaleY(context) + fontPxSize;
        } else if (verticalAnchor === 'middle') {
            finalY = y / FontScaleService.getScaleY(context) + fontPxSize / 2;
        }

        context.fillText(text, finalX, finalY);

        context.restore();
    }

    static drawUndistortedTextTwoLines(context, //: CanvasRenderingContext2D,
                                              text, //: string,
                                              text2, //: string,
                                              fontPxSize, //: number,
                                              fontType, //: string,
                                              x, //: number,
                                              y, //: number,
                                              color, //: string,
                                              horizontalAnchor, //: 'left' | 'center' | 'right',
                                              verticalAnchor) {//: 'top' | 'middle' | 'bottom') {
        context.save();

        context.scale(FontScaleService.getScaleX(context), FontScaleService.getScaleY(context));
        context.font = (fontPxSize + 'px' + ' ' + fontType);
        context.fillStyle = color;

        let finalXUpperLine;
        let finalXLowerLine;

        let finalYUpperLine;
        let finalYLowerLine;

        if (horizontalAnchor === 'left') {
            finalXUpperLine = x / FontScaleService.getScaleX(context);
            finalXLowerLine = x / FontScaleService.getScaleX(context);
        } else if (horizontalAnchor === 'right') {
            finalXUpperLine = x / FontScaleService.getScaleX(context) - context.measureText(text).width;
            finalXLowerLine = x / FontScaleService.getScaleX(context) - context.measureText(text2).width;
        } else {
            finalXUpperLine = x / FontScaleService.getScaleX(context) - context.measureText(text).width / 2;
            finalXLowerLine = x / FontScaleService.getScaleX(context) - context.measureText(text2).width / 2;
        }

        if (verticalAnchor === 'bottom') {
            finalYLowerLine = y / FontScaleService.getScaleY(context);
            finalYUpperLine = finalYLowerLine - fontPxSize;
        } else if (verticalAnchor === 'middle') {
            finalYUpperLine = y / FontScaleService.getScaleY(context);
            finalYLowerLine = finalYUpperLine + fontPxSize;
        } else {
            finalYUpperLine = y / FontScaleService.getScaleY(context) + fontPxSize;
            finalYLowerLine = finalYUpperLine + fontPxSize;
        }

        context.fillText(text, finalXUpperLine, finalYUpperLine);
        context.fillText(text2, finalXLowerLine, finalYLowerLine);

        context.restore();
    }
}
