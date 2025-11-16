export type TitleContentType = {
    title: string,
    content: string,
    paddingBottom?: number
    indent?: number
}

export type TitleType = {
    text: string;
    bold?: boolean;
    size?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    underline?: true
}

// export const TitleType = {
//     text: string; 
//     bold: boolean = false, 
//     size: number = 10,
//      paddingTop: number = 400, 
//      paddingBottom: number = 200