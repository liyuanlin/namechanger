export enum CommentsType{
    Unknown=0,
    Single=1,
    Multi=2,/* like this */
    SingleDefine=3,
    SingleEndDefine=4,
    MultiSummary=5,  //for c# /// <summary></<summary>
    MultiHtml=6, //for html  <!-- some comment -->
    MultiCss=7,
    MultiJs=8   //for js  like below
        /**
     * get all the blocks that in quotes
     * @param fullText 全文
     * @param quoteChars 引号字符
     * @returns QuoteBlock[] 找到的字符块
     */
}