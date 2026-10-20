export interface Shifts {
    key:string;
    value:number;
    label:string;

}

export const tomNumber:Shifts[] = [80,81,51,52].map((value)=>(
    {key:String(value),value,label:`TOM ${value}`}
))

export interface impHeader {
    key:string
    label:string
}


export const ImprestHeaders : impHeader[] = ['TOM Number','IMPREST ISSUED','ADVANCE ISSUED','TOTAL'].map((value)=>({
    key:String(value),value,label:`${value}`
}))