const {supabase}=require('../config/supabase');const {HttpError,asyncHandler}=require('../utils/http');
const create=asyncHandler(async(req,res)=>{const reason=String(req.body.reason||'').trim();if(reason.length<8||reason.length>2000)throw new HttpError(400,'Please describe the issue (8 to 2,000 characters)');const {data,error}=await supabase.from('event_reports').insert({event_id:req.params.id,reported_by:req.user?.id||null,reason}).select().single();if(error)throw new HttpError(400,'Unable to submit report');res.status(201).json({data})});
module.exports={create};
