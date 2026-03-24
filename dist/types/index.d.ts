import { BlockType } from "./block-type";
import { CommentsType } from "./comments-type";
import { ValueType } from "./value-types";
export interface BaseBlock {
    start: number;
    length: number;
    content: string;
}
export interface ChineseBlock extends BaseBlock {
    type: BlockType;
    commentsType?: CommentsType;
    valueType?: ValueType;
}
export type QuoteCharType = "'" | "\"" | '`';
export interface QuoteBlock extends BaseBlock {
    type: string;
}
/**
 * 标签类型
 * 已知 vue(template,script,style),react (all html tag,empty tag <>...</>)
 */
export type TagType = string;
/**
 * 页面块 例如 .vue 文件可以分成3块: htmltemplate, script, style
 */
export interface PagePartBlock extends BaseBlock {
    level: number;
    type: string;
}
export type FunctionReplaceString = (transValue: string) => string;
export interface InsertLineType {
    type: string;
    find: string;
    postion: string;
    postion_ext?: {
        then: string;
        count: number;
    };
    line: string;
}
//# sourceMappingURL=index.d.ts.map