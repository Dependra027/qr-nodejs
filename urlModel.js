const mongoose=require('mongoose')

const url=new mongoose.Schema({
    urls:{type:String,required:[true,"Enter Url to Convert"],index:true}
},{timestamps:true})

url.index({"url":'text'});
module.exports=mongoose.model('UrlModel',url);