
firebase.initializeApp(window.firebaseConfig);
const auth=firebase.auth(), db=firebase.firestore();
const $=id=>document.getElementById(id);
let orders=[], editingId=null;

function normWa(v){let n=String(v||'').replace(/\D/g,'');if(n.startsWith('0'))n='62'+n.slice(1);return n}
function rupiah(v){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v||0))}
function ymd(d=new Date()){return String(d.getFullYear()).slice(-2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')}
function warrantyInfo(o){
 const start=new Date(o.orderDate+'T00:00:00'); const end=new Date(start); end.setDate(end.getDate()+Number(o.warrantyDays||0));
 const left=Math.ceil((end-new Date())/86400000);
 return {end,left,label:left<0?'Habis':left<=3?'Hampir Habis':'Aktif',cls:left<0?'habis':left<=3?'hampir':'aktif'};
}
function msg(id,text){$(id).textContent=text;$(id).classList.remove('hidden');setTimeout(()=>$(id).classList.add('hidden'),3500)}

async function nextOrderId(){
 const key=ymd(), ref=db.collection('counters').doc(key);
 return db.runTransaction(async tx=>{
   const snap=await tx.get(ref); const next=snap.exists?Number(snap.data().last||0)+1:1;
   tx.set(ref,{last:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
   return `JS${key}${String(next).padStart(4,'0')}`;
 });
}
function readForm(){
 return {
  customerName:$('customerName').value.trim(), whatsapp:normWa($('whatsapp').value),
  product:$('product').value.trim(), price:Number($('price').value||0),
  orderDate:$('orderDate').value, duration:$('duration').value.trim(),
  warrantyDays:Number($('warrantyDays').value||0), payment:$('payment').value
 };
}
function validate(o){return o.customerName&&o.whatsapp&&o.product&&o.price>=0&&o.orderDate&&o.warrantyDays>=0}
function clearForm(){
 editingId=null;$('formTitle').textContent='Tambah Pesanan';$('orderId').value='';
 ['customerName','whatsapp','product','price','duration'].forEach(id=>$(id).value='');
 $('warrantyDays').value=30;$('cancelBtn').classList.add('hidden');$('saveBtn').textContent='Simpan Pesanan';
 const n=new Date();n.setMinutes(n.getMinutes()-n.getTimezoneOffset());$('orderDate').value=n.toISOString().slice(0,10)
}
async function savePublic(order){
 const batch=db.batch();
 const pub=db.collection('publicOrders').doc(order.orderId);
 batch.set(pub,order);
 const lookup=db.collection('customerLookups').doc(order.whatsapp).collection('orders').doc(order.orderId);
 batch.set(lookup,order);
 await batch.commit();
}
$('loginBtn').onclick=async()=>{try{await auth.signInWithEmailAndPassword($('email').value,$('password').value)}catch(e){msg('loginMsg','Login gagal: '+e.message)}};
$('logoutBtn').onclick=()=>auth.signOut();
auth.onAuthStateChanged(user=>{
 $('loginBox').classList.toggle('hidden',!!user);$('app').classList.toggle('hidden',!user);
 if(user) subscribe();
});
$('saveBtn').onclick=async()=>{
 try{
  const data=readForm(); if(!validate(data)) return msg('formMsg','Lengkapi semua kolom wajib.');
  $('saveBtn').disabled=true;
  if(editingId){
    const old=orders.find(x=>x.id===editingId); data.orderId=old.orderId;
    data.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('orders').doc(editingId).set(data,{merge:true});
    await savePublic({...data,updatedAt:new Date().toISOString()});
  }else{
    data.orderId=await nextOrderId();
    data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
    const ref=await db.collection('orders').add(data);
    await savePublic({...data,createdAt:new Date().toISOString()});
    $('orderId').value=data.orderId;
  }
  msg('formMsg','Pesanan berhasil disimpan. ID: '+data.orderId); setTimeout(clearForm,900);
 }catch(e){msg('formMsg','Gagal menyimpan: '+e.message)}
 finally{$('saveBtn').disabled=false}
};
$('cancelBtn').onclick=clearForm;
function subscribe(){
 db.collection('orders').orderBy('createdAt','desc').onSnapshot(s=>{
  orders=s.docs.map(d=>({id:d.id,...d.data()}));render();
 },e=>msg('formMsg','Gagal membaca data: '+e.message));
}
function render(){
 const q=$('filter').value.toLowerCase(); const list=orders.filter(o=>[o.orderId,o.customerName,o.whatsapp,o.product].join(' ').toLowerCase().includes(q));
 $('rows').innerHTML=list.map(o=>{const w=warrantyInfo(o);return `<tr>
 <td><b>${o.orderId||'-'}</b></td><td>${o.customerName||'-'}</td><td>${o.whatsapp||'-'}</td><td>${o.product||'-'}</td>
 <td>${rupiah(o.price)}</td><td>${o.orderDate||'-'}</td><td><span class="badge ${w.cls}">${w.label}</span><br><small>s/d ${w.end.toLocaleDateString('id-ID')}</small></td>
 <td><button onclick="editOrder('${o.id}')">Edit</button> <button class="secondary" onclick="deleteOrder('${o.id}')">Hapus</button></td></tr>`}).join('');
 $('statTotal').textContent=orders.length;$('statActive').textContent=orders.filter(o=>warrantyInfo(o).left>=0).length;
 $('statExpired').textContent=orders.filter(o=>warrantyInfo(o).left<0).length;$('statRevenue').textContent=rupiah(orders.reduce((a,o)=>a+Number(o.price||0),0));
}
$('filter').oninput=render;
window.editOrder=id=>{
 const o=orders.find(x=>x.id===id);if(!o)return;editingId=id;$('formTitle').textContent='Edit Pesanan';
 ['orderId','customerName','whatsapp','product','price','orderDate','duration','warrantyDays','payment'].forEach(k=>$(k).value=o[k]??'');
 $('cancelBtn').classList.remove('hidden');$('saveBtn').textContent='Simpan Perubahan';scrollTo({top:0,behavior:'smooth'});
};
window.deleteOrder=async id=>{
 const o=orders.find(x=>x.id===id);if(!o||!confirm('Hapus pesanan '+o.orderId+'?'))return;
 try{
  const batch=db.batch();batch.delete(db.collection('orders').doc(id));batch.delete(db.collection('publicOrders').doc(o.orderId));
  batch.delete(db.collection('customerLookups').doc(o.whatsapp).collection('orders').doc(o.orderId));await batch.commit();
 }catch(e){alert('Gagal menghapus: '+e.message)}
};
clearForm();
