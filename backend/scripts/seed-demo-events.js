require('dotenv').config();
const crypto=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');

if(process.env.ALLOW_DEMO_SEED!=='true'){
  console.error('Refusing to seed. Set ALLOW_DEMO_SEED=true for this one run.');
  process.exit(1);
}
for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'])if(!process.env[key]){
  console.error(`Missing required environment variable: ${key}`);process.exit(1);
}

const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const projectRef=new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const ownerEmail=`utsav-demo-seed-${projectRef}@example.invalid`;
const categoryDefinitions=[
  {name:'Festivals',slug:'festivals'},
  {name:'Cultural Events',slug:'cultural-events'},
  {name:'Fairs',slug:'fairs'},
  {name:'Melas',slug:'melas'},
  {name:'Religious Yatras',slug:'religious-yatras'},
  {name:'Traditional Celebrations',slug:'traditional-celebrations'}
];
const stateByCity={
  Jaipur:'Rajasthan',Varanasi:'Uttar Pradesh',Kolkata:'West Bengal',Kochi:'Kerala',Pushkar:'Rajasthan',Kohima:'Nagaland',Ahmedabad:'Gujarat',Puri:'Odisha',Madurai:'Tamil Nadu',Udaipur:'Rajasthan',Mysuru:'Karnataka',Pune:'Maharashtra',Amritsar:'Punjab',Guwahati:'Assam',Rishikesh:'Uttarakhand',Hyderabad:'Telangana',Bhubaneswar:'Odisha',Chennai:'Tamil Nadu',
  Visakhapatnam:'Andhra Pradesh',Itanagar:'Arunachal Pradesh',Patna:'Bihar',Raipur:'Chhattisgarh',Panaji:'Goa',Kurukshetra:'Haryana',Shimla:'Himachal Pradesh',Ranchi:'Jharkhand',Bhopal:'Madhya Pradesh',Imphal:'Manipur',Shillong:'Meghalaya',Aizawl:'Mizoram',Gangtok:'Sikkim',Agartala:'Tripura'
};
const indianStates=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const posterIds=[
  'photo-1492684223066-81342ee5ff30','photo-1514525253161-7a46d19cd819',
  'photo-1506157786151-b8491531f063','photo-1511795409834-ef04bbd61622',
  'photo-1470229722913-7c0e2dbbafd3','photo-1501281668745-f7f57925c3b4'
];
const rawEvents=[
  ['Amber Courtyard Festival [DEMO]','Jaipur','City Palace outer courtyard','Festivals',26.9255,75.8236,'A fictional city celebration combining folk music, craft demonstrations, and seasonal food stalls in Jaipur.'],
  ['Ganga Lantern Gathering [DEMO]','Varanasi','Assi Ghat riverfront','Religious Yatras',25.2881,83.0067,'A fictional evening gathering along the riverfront, designed as a sample listing for a community calendar.'],
  ['City of Joy Folk Week [DEMO]','Kolkata','Maidan cultural grounds','Cultural Events',22.5448,88.3426,'A fictional program of regional music, dance, and neighbourhood storytelling in Kolkata.'],
  ['Fort Kochi Coastal Arts Days [DEMO]','Kochi','Fort Kochi promenade','Traditional Celebrations',9.9658,76.2421,'A fictional coastal arts program featuring community performances and demonstrations of local craft.'],
  ['Desert Trails Fair [DEMO]','Pushkar','Pushkar fairground','Fairs',26.4899,74.5511,'A fictional desert community fair with artisan stalls, folk performances, and regional food.'],
  ['Seven Tribes Folk Assembly [DEMO]','Kohima','Kisama heritage village grounds','Cultural Events',25.6707,94.1086,'A fictional gathering celebrating the variety of Naga music, craft, and oral storytelling traditions.'],
  ['Sabarmati Harvest Mela [DEMO]','Ahmedabad','Sabarmati Riverfront promenade','Melas',23.0258,72.5804,'A fictional riverfront mela bringing local makers, folk performers, and seasonal foods together.'],
  ['Jagannath Pathways Yatra [DEMO]','Puri','Grand Road community pavilion','Religious Yatras',19.8033,85.8315,'A fictional sample yatra listing inspired by the tradition of shared pilgrimage; dates and program are not verified.'],
  ['Madurai Temple Arts Season [DEMO]','Madurai','Meenakshi temple arts quarter','Traditional Celebrations',9.9195,78.1193,'A fictional series of music, craft, and community programs in Madurai’s historic temple district.'],
  ['Lakeside Craft Fair [DEMO]','Udaipur','Fateh Sagar lakeside lawns','Fairs',24.6004,73.6779,'A fictional lakeside fair featuring regional textile, pottery, and food demonstrations.'],
  ['Mysuru Heritage Celebration [DEMO]','Mysuru','Mysuru Palace public grounds','Festivals',12.3052,76.6552,'A fictional heritage celebration built around local music, illumination, and craft traditions.'],
  ['Pune Street Theatre Mela [DEMO]','Pune','Shaniwar Wada public square','Melas',18.5196,73.8553,'A fictional public mela with street theatre, dance, and participatory workshops by local artists.'],
  ['Golden Temple Community Week [DEMO]','Amritsar','Heritage Street community court','Traditional Celebrations',31.6200,74.8765,'A fictional community program about hospitality, music, and shared food traditions in Amritsar.'],
  ['Brahmaputra Boat and Folk Days [DEMO]','Guwahati','Uzan Bazaar riverfront','Cultural Events',26.1852,91.7509,'A fictional riverfront program with folk music, craft stalls, and boat culture displays.'],
  ['Rishikesh River Pilgrim Walk [DEMO]','Rishikesh','Triveni Ghat approach','Religious Yatras',30.1083,78.2973,'A fictional sample pilgrimage walk listing; its route, schedule, and participation details require organizer verification.'],
  ['Deccan Makers Fair [DEMO]','Hyderabad','Charminar heritage precinct','Fairs',17.3616,78.4747,'A fictional heritage precinct fair featuring Deccan crafts, food, and live community performances.'],
  ['Ekamra Classical Arts Festival [DEMO]','Bhubaneswar','Ekamra Haat cultural courtyard','Festivals',20.2742,85.8336,'A fictional program presenting classical and folk performance traditions in a community courtyard.'],
  ['Chennai Coast Music Days [DEMO]','Chennai','Marina Beach public promenade','Cultural Events',13.0500,80.2824,'A fictional coastal music gathering with local ensembles, storytelling, and community workshops.'],
  ['Coastal Banyan Festival [DEMO]','Visakhapatnam','RK Beach promenade, Andhra Pradesh','Festivals',17.7148,83.3239,'A fictional coastal gathering for local music, fishing-community stories, and craft demonstrations in Andhra Pradesh.'],
  ['Dawn over the Hills Cultural Gathering [DEMO]','Itanagar','Ganga Lake community lawns, Arunachal Pradesh','Cultural Events',27.0844,93.6053,'A fictional community program sharing music, weaving, and regional storytelling from Arunachal Pradesh.'],
  ['Ganga Plains Handcraft Fair [DEMO]','Patna','Gandhi Maidan craft court, Bihar','Fairs',25.5941,85.1376,'A fictional handcraft fair with sample stalls for weaving, pottery, and food traditions from Bihar.'],
  ['Mahua Courtyard Mela [DEMO]','Raipur','Purkhouti Muktangan grounds, Chhattisgarh','Melas',21.2367,81.6975,'A fictional community mela featuring folk instruments, craft demonstrations, and seasonal food from Chhattisgarh.'],
  ['Monsoon Mandovi Traditions Festival [DEMO]','Panaji','Campal riverside gardens, Goa','Traditional Celebrations',15.4976,73.8278,'A fictional riverside program of Goan music, dance, foodways, and community arts.'],
  ['Brahma Sarovar Pilgrim Circuit Yatra [DEMO]','Kurukshetra','Brahma Sarovar approach, Haryana','Religious Yatras',29.9695,76.8783,'A fictional sample pilgrimage route listing connecting heritage stops in Haryana; route and schedule are unverified.'],
  ['Ridge Lantern Folk Festival [DEMO]','Shimla','The Ridge public square, Himachal Pradesh','Festivals',31.1048,77.1734,'A fictional hill-town gathering for folk music, seasonal crafts, and community storytelling from Himachal Pradesh.'],
  ['Jharkhand Drum and Craft Week [DEMO]','Ranchi','Morabadi grounds, Jharkhand','Cultural Events',23.4068,85.3268,'A fictional arts week with sample demonstrations of regional percussion, craft, and oral history from Jharkhand.'],
  ['Lake City Harvest Fair [DEMO]','Bhopal','Bharat Bhavan public lawns, Madhya Pradesh','Fairs',23.2420,77.4040,'A fictional harvest-season fair with local food, craft, and music demonstrations in Madhya Pradesh.'],
  ['Imphal Lai Haraoba Arts Gathering [DEMO]','Imphal','Kangla heritage complex, Manipur','Melas',24.8170,93.9368,'A fictional sample cultural gathering inspired by community arts traditions in Manipur; it is not a real festival announcement.'],
  ['Pine and Cloud Traditional Arts Days [DEMO]','Shillong','Ward’s Lake community grounds, Meghalaya','Traditional Celebrations',25.5746,91.8842,'A fictional program for Khasi music, craft, and shared food traditions in Meghalaya.'],
  ['Blue Hills Community Festival [DEMO]','Aizawl','Vanapa Hall public grounds, Mizoram','Cultural Events',23.7271,92.7176,'A fictional gathering for Mizo choral music, craft, and community storytelling.'],
  ['Kanchenjunga Paths Pilgrim Yatra [DEMO]','Gangtok','Ridge Park approach, Sikkim','Religious Yatras',27.3314,88.6138,'A fictional sample walking route connecting community heritage sites in Sikkim; all route details are illustrative.'],
  ['Ujjayanta Courtyard Mela [DEMO]','Agartala','Rabindra Kanan gardens, Tripura','Festivals',23.8315,91.2793,'A fictional garden mela with sample Tripuri craft, music, and seasonal food stalls.']
];

function ymd(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function check(result,label){if(result.error)throw new Error(`${label}: ${result.error.message}`);return result.data}
async function getOrCreateSeedOwner(){
  for(let page=1;page<=20;page++){
    const result=await supabase.auth.admin.listUsers({page,perPage:500});
    if(result.error)throw new Error(`Could not check seed owner account: ${result.error.message}`);
    const owner=result.data.users.find(user=>user.email===ownerEmail);
    if(owner)return owner;
    if(result.data.users.length<500)break;
  }
  const created=await supabase.auth.admin.createUser({email:ownerEmail,password:crypto.randomBytes(48).toString('base64url'),email_confirm:true,user_metadata:{seed_owner:'utsav-darshan-demo-data',full_name:'Utsav Darshan demonstration data'}});
  if(created.error)throw new Error(`Could not create the demo attribution profile: ${created.error.message}`);
  return created.data.user;
}

async function main(){
  const before=await supabase.from('events').select('id',{count:'exact',head:true});
  check(before,'Could not inspect existing events');
  console.log(`Existing events: ${before.count||0}. Existing unrelated events will never be updated or deleted.`);

  const currentCategories=check(await supabase.from('event_categories').select('id,name,slug'),'Could not inspect categories');
  const missing=categoryDefinitions.filter(category=>!currentCategories.some(existing=>existing.name===category.name));
  if(missing.length)check(await supabase.from('event_categories').upsert(missing,{onConflict:'slug',ignoreDuplicates:true}),'Could not seed categories');
  const savedCategories=check(await supabase.from('event_categories').select('id,name,slug').in('slug',categoryDefinitions.map(category=>category.slug)),'Could not load seeded categories');
  const categoryIds=new Map(savedCategories.map(category=>[category.name,category.id]));
  for(const category of categoryDefinitions)if(!categoryIds.has(category.name))throw new Error(`Required demo category is missing: ${category.name}`);

  const owner=await getOrCreateSeedOwner();
  check(await supabase.from('profiles').upsert({id:owner.id,full_name:'Utsav Darshan demonstration data',role:'user'},{onConflict:'id',ignoreDuplicates:true}),'Could not ensure demo attribution profile');

  const start=new Date();start.setHours(0,0,0,0);
  const names=rawEvents.map(event=>event[0]);
  const existing=check(await supabase.from('events').select('id,event_name,city,location,created_by').in('event_name',names),'Could not check for existing demo rows');
  const existingNames=new Set(existing.map(event=>event.event_name));
  let labeledExisting=0;
  for(const event of existing){
    const state=stateByCity[event.city];
    if(event.created_by!==owner.id||!state||event.location.toLowerCase().includes(state.toLowerCase()))continue;
    check(await supabase.from('events').update({location:`${event.location}, ${state}`}).eq('id',event.id).eq('created_by',owner.id),'Could not add the state label to an existing demo event');
    labeledExisting++;
  }
  const rows=rawEvents.filter(event=>!existingNames.has(event[0])).map((event,index)=>{
    const [event_name,city,location,category,latitude,longitude,summary]=event;
    const dayOffset=index<18?15+index*7:18+(index-18)*12;
    const startDate=new Date(start);startDate.setDate(startDate.getDate()+dayOffset);
    const endDate=new Date(startDate);endDate.setDate(endDate.getDate()+(index%3)+1);
    const poster=`https://images.unsplash.com/${posterIds[index%posterIds.length]}?auto=format&fit=crop&w=1200&q=85`;
    return {event_name,city,location,category_id:categoryIds.get(category),start_date:ymd(startDate),end_date:ymd(endDate),description:`DEMONSTRATION DATA ONLY. ${summary} The event, schedule, venue details, and stock poster are illustrative examples, not a verified announcement. Confirm all details with an organizer before publishing as real event information.`,cultural_significance:`Illustrative cultural context for interface demonstration only. This is not a verified event description or organizer statement.`,poster_url:poster,latitude,longitude,status:'approved',created_by:owner.id};
  });
  if(rows.length)check(await supabase.from('events').insert(rows),'Could not insert demonstration events');
  const coverageRows=check(await supabase.from('events').select('event_name,city').in('event_name',names),'Could not verify state coverage');
  const representedStates=new Set(coverageRows.map(event=>stateByCity[event.city]).filter(Boolean));
  const missingStates=indianStates.filter(state=>!representedStates.has(state));
  if(missingStates.length)throw new Error(`State coverage incomplete: ${missingStates.join(', ')}`);
  console.log(`Categories already present: ${currentCategories.length}; requested categories ensured: ${categoryDefinitions.length}.`);
  console.log(`Demo owner profile: ${owner.id}.`);
  console.log(`Inserted demonstration events: ${rows.length}; skipped existing marked names: ${existingNames.size}; added state labels to existing demo locations: ${labeledExisting}.`);
  console.log(`Indian state coverage: ${representedStates.size}/${indianStates.length}; state names are included in event locations.`);
  console.log('All seeded events are approved for display and explicitly marked [DEMO] in their names and descriptions.');
}

main().catch(error=>{console.error(error.message);process.exitCode=1});
