/**
 * Script gửi dữ liệu thật lên Basin Catalog Stream Endpoint
 * Dành cho Nhóm 9
 */

async function sendRealData() {
  const STREAM_URL = 'https://f8fb6f6f730b404fb2f273fd789d04df.ingest.cloudflare.com';

  console.log('--- Đang lấy thông tin mạng thật từ Cloudflare Trace ---');
  let realIp = '116.107.164.253';
  let realCountry = 'VN';

  try {
    const traceRes = await fetch('https://cloudflare.com/cdn-cgi/trace');
    const traceText = await traceRes.text();
    const lines = traceText.split('\n');
    for (const line of lines) {
      if (line.startsWith('ip=')) realIp = line.replace('ip=', '').trim();
      if (line.startsWith('loc=')) realCountry = line.replace('loc=', '').trim();
    }
  } catch (e) {
    console.warn('Không thể gọi trace, dùng IP mặc định:', realIp);
  }

  // Nhận diện OS thực tế của máy
  const platform = process.platform;
  let device = 'windows';
  if (platform === 'darwin') device = 'macos';
  else if (platform === 'linux') device = 'linux';

  const payload = {
    id: 'Nhóm 9 CNTT K22H',
    country: realCountry,
    device: device,
    ip: realIp,
    time: Date.now(), // Milliseconds theo chuẩn yêu cầu
    meta: {
      website: 'Soopi',
      source: 'live_stream_sender',
      os: process.platform,
      node_version: process.version
    }
  };

  console.log('--- Payload gửi đi ---');
  console.log(JSON.stringify(payload, null, 2));

  console.log('\n--- Đang gửi lên Stream Endpoint ---');
  const res = await fetch(STREAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.text();
  console.log(`Kết quả: Status ${res.status} ${res.statusText}`);
  console.log(`Phản hồi từ server: ${body}`);

  if (res.status === 200) {
    console.log('\n✅ ĐÃ GỬI THÀNH CÔNG DỮ LIỆU THẬT CHO NHÓM 9 LÊN BASIN CATALOG!');
  }
}

sendRealData();

