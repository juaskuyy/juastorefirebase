
firebase.initializeApp(window.firebaseConfig);const db=firebase.firestore(),$=id=>document.getElementById(id);
function normWa(v){let n=String(v||'').replace(/\D/g,'');if(n.startsWith('0'))n='62'+n.slice(1);return n}
function rupiah(v){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v||0))}
function warranty(o){const e=new Date(o.orderDate+'T00:00:00');e.setDate(e.getDate()+Number(o.warrantyDays||0));const l=Math.ceil((e-new Date())/86400000);return{end:e,left:l,label:l<0?'Habis':l<=3?'Hampir Habis':'Aktif',cls:l<0?'habis':l<=3?'hampir':'aktif'}}
function showMsg(t){$('message').textContent=t;$('message').classList.remove('hidden');$('results').classList.add('hidden')}
function card(o){const w=warranty(o);const claim=`Halo Admin JuaStore,%0A%0ASaya ingin mengajukan garansi.%0AID Order: ${encodeURIComponent(o.orderId)}%0AProduk: ${encodeURIComponent(o.product)}%0ANama: ${encodeURIComponent(o.customerName)}%0AKendala: `;return `<section class="card">
<h3>${o.product} <span class="badge ${w.cls}">${w.label}</span></h3><div class="resultgrid">
<div class="item"><small>ID Order</small><b>${o.orderId}</b></div><div class="item"><small>Customer</small><b>${o.customerName}</b></div>
<div class="item"><small>WhatsApp</small><b>${o.whatsapp}</b></div><div class="item"><small>Harga</small><b>${rupiah(o.price)}</b></div>
<div class="item"><small>Tanggal Order</small><b>${new Date(o.orderDate+'T00:00:00').toLocaleDateString('id-ID')}</b></div>
<div class="item"><small>Garansi Sampai</small><b>${w.end.toLocaleDateString('id-ID')}</b></div></div>
<div class="actions">${w.left>=0?`<a class="btn" target="_blank" href="https://wa.me/6285111662004?text=${claim}">Ajukan Garansi</a>`:'<span class="notice">Masa garansi sudah berakhir.</span>'}</div></section>`}
async function search(){
 const raw=$('search').value.trim();if(!raw)return showMsg('Masukkan ID Order atau nomor WhatsApp.');
 $('searchBtn').disabled=true;$('message').classList.add('hidden');
 try{
  let data=[];
  if(/^JS\d+/i.test(raw)){
   const d=await db.collection('publicOrders').doc(raw.toUpperCase()).get();if(d.exists)data=[d.data()];
  }else{
   const wa=normWa(raw);const s=await db.collection('customerLookups').doc(wa).collection('orders').get();data=s.docs.map(d=>d.data());
  }
  if(!data.length)return showMsg('Data pesanan tidak ditemukan. Periksa kembali ID Order atau nomor WhatsApp.');
  $('results').innerHTML=data.map(card).join('');$('results').classList.remove('hidden');
 }catch(e){showMsg('Pencarian gagal: '+e.message)}
 finally{$('searchBtn').disabled=false}
}
$('searchBtn').onclick=search;$('search').addEventListener('keydown',e=>{if(e.key==='Enter')search()});
