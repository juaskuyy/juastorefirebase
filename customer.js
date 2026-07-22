
firebase.initializeApp(window.firebaseConfig);
const db=firebase.firestore(),$=id=>document.getElementById(id);

function normWa(v){
  let n=String(v||'').replace(/\D/g,'');
  if(n.startsWith('0'))n='62'+n.slice(1);
  return n;
}
function rupiah(v){
  return new Intl.NumberFormat('id-ID',{
    style:'currency',currency:'IDR',maximumFractionDigits:0
  }).format(Number(v||0));
}
function warranty(o){
  const e=new Date(o.orderDate+'T00:00:00');
  e.setDate(e.getDate()+Number(o.warrantyDays||0));
  const l=Math.ceil((e-new Date())/86400000);
  return{
    end:e,
    left:l,
    label:l<0?'Habis':l<=3?'Hampir Habis':'Aktif',
    cls:l<0?'habis':l<=3?'hampir':'aktif'
  };
}
function showMsg(t){
  $('message').textContent=t;
  $('message').classList.remove('hidden');
  $('results').classList.add('hidden');
}
function esc(v){
  return String(v??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}
function orderCard(o){
  const w=warranty(o);
  return `<section class="card">
    <h3>${esc(o.product)} <span class="badge ${w.cls}">${w.label}</span></h3>
    <div class="resultgrid">
      <div class="item"><small>ID Order</small><b>${esc(o.orderId)}</b></div>
      <div class="item"><small>Customer</small><b>${esc(o.customerName)}</b></div>
      <div class="item"><small>WhatsApp</small><b>${esc(o.whatsapp)}</b></div>
      <div class="item"><small>Produk</small><b>${esc(o.product)}</b></div>
      <div class="item"><small>Durasi</small><b>${esc(o.duration||'-')}</b></div>
      <div class="item"><small>Harga</small><b>${rupiah(o.price)}</b></div>
      <div class="item"><small>Tanggal Order</small><b>${new Date(o.orderDate+'T00:00:00').toLocaleDateString('id-ID')}</b></div>
      <div class="item"><small>Garansi Sampai</small><b>${w.end.toLocaleDateString('id-ID')}</b></div>
    </div>
    <div class="notice">
      ID Order hanya digunakan untuk melihat detail pesanan. Untuk mengajukan garansi, masukkan kode garansi.
    </div>
  </section>`;
}
function warrantyCard(o,index){
  const w=warranty(o);
  return `<section class="card">
    <h3>${esc(o.product)} <span class="badge ${w.cls}">${w.label}</span></h3>
    <div class="resultgrid">
      <div class="item"><small>Kode Garansi</small><b>${esc(o.warrantyCode)}</b></div>
      <div class="item"><small>ID Order</small><b>${esc(o.orderId)}</b></div>
      <div class="item"><small>Customer</small><b>${esc(o.customerName)}</b></div>
      <div class="item"><small>WhatsApp</small><b>${esc(o.whatsapp)}</b></div>
      <div class="item"><small>Produk</small><b>${esc(o.product)}</b></div>
      <div class="item"><small>Tanggal Order</small><b>${new Date(o.orderDate+'T00:00:00').toLocaleDateString('id-ID')}</b></div>
      <div class="item"><small>Garansi Sampai</small><b>${w.end.toLocaleDateString('id-ID')}</b></div>
    </div>

    ${w.left>=0 ? `
      <div class="claim-box">
        <label for="issue-${index}"><b>📝 Kendala yang dialami</b></label>
        <textarea
          id="issue-${index}"
          class="claim-issue"
          rows="5"
          placeholder="Contoh: akun tidak bisa login, password salah, atau fitur premium tidak aktif..."
        ></textarea>
        <small class="claim-help">
          Jelaskan kendala dengan lengkap. Screenshot bukti dikirim manual setelah WhatsApp terbuka.
        </small>
        <button class="claim-btn" data-index="${index}" type="button">
          Ajukan Garansi
        </button>
      </div>
    ` : `<div class="notice">Masa garansi sudah berakhir dan tidak dapat diklaim.</div>`}
  </section>`;
}

let currentResults=[];

async function submitClaim(index){
  const o=currentResults[index];
  if(!o)return;

  const issueEl=document.getElementById(`issue-${index}`);
  const issue=(issueEl?.value||'').trim();

  if(!issue){
    alert('Silakan tulis kendala terlebih dahulu.');
    issueEl?.focus();
    return;
  }

  const text=`📋 PENGAJUAN GARANSI JUASTORE

🔐 Kode Garansi: ${o.warrantyCode}
🆔 ID Order: ${o.orderId}
👤 Nama: ${o.customerName}
📱 WhatsApp: ${o.whatsapp}
📦 Produk: ${o.product}
📅 Tanggal Order: ${new Date(o.orderDate+'T00:00:00').toLocaleDateString('id-ID')}

📝 Kendala:
${issue}

📷 Bukti screenshot akan dikirim setelah pesan ini.

Mohon diproses. Terima kasih.`;

  window.open(
    `https://wa.me/6285111662004?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener'
  );
}

async function search(){
  const raw=$('search').value.trim();
  if(!raw)return showMsg('Masukkan ID Order, nomor WhatsApp, atau kode garansi.');

  $('searchBtn').disabled=true;
  $('message').classList.add('hidden');

  try{
    let data=[];
    let claimMode=false;
    const upper=raw.toUpperCase();

    if(/^JS-GR-[A-Z0-9]+$/i.test(raw)){
      claimMode=true;
      const d=await db.collection('warrantyLookups').doc(upper).get();
      if(d.exists)data=[d.data()];
    }else if(/^JS\d+$/i.test(raw)){
      const d=await db.collection('publicOrders').doc(upper).get();
      if(d.exists)data=[d.data()];
    }else{
      const wa=normWa(raw);
      const s=await db.collection('customerLookups').doc(wa).collection('orders').get();
      data=s.docs.map(d=>d.data());
    }

    if(!data.length){
      currentResults=[];
      return showMsg(
        claimMode
          ? 'Kode garansi tidak ditemukan. Periksa kembali kode yang dimasukkan.'
          : 'Data pesanan tidak ditemukan. Periksa kembali ID Order atau nomor WhatsApp.'
      );
    }

    currentResults=data;
    $('results').innerHTML=claimMode
      ? data.map(warrantyCard).join('')
      : data.map(orderCard).join('');
    $('results').classList.remove('hidden');

    if(claimMode){
      document.querySelectorAll('.claim-btn').forEach(btn=>{
        btn.addEventListener('click',()=>submitClaim(Number(btn.dataset.index)));
      });
    }
  }catch(e){
    showMsg('Pencarian gagal: '+e.message);
  }finally{
    $('searchBtn').disabled=false;
  }
}

$('searchBtn').onclick=search;
$('search').addEventListener('keydown',e=>{
  if(e.key==='Enter')search();
});
