"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsType = void 0;
var CommentsType;
(function (CommentsType) {
    CommentsType[CommentsType["Unknown"] = 0] = "Unknown";
    CommentsType[CommentsType["Single"] = 1] = "Single";
    CommentsType[CommentsType["Multi"] = 2] = "Multi";
    CommentsType[CommentsType["SingleDefine"] = 3] = "SingleDefine";
    CommentsType[CommentsType["SingleEndDefine"] = 4] = "SingleEndDefine";
    CommentsType[CommentsType["MultiSummary"] = 5] = "MultiSummary";
    CommentsType[CommentsType["MultiHtml"] = 6] = "MultiHtml";
    CommentsType[CommentsType["MultiCss"] = 7] = "MultiCss";
    CommentsType[CommentsType["MultiJs"] = 8] = "MultiJs"; //for js  like below
    /**
 * get all the blocks that in quotes
 * @param fullText 全文
 * @param quoteChars 引号字符
 * @returns QuoteBlock[] 找到的字符块
 */
})(CommentsType || (exports.CommentsType = CommentsType = {}));
//# sourceMappingURL=comments-type.js.map