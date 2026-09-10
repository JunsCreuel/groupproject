// 인스타그램 스토리 공유 — 스토리 비율(9:16) 카드를 캔버스로 그려서
// Web Share API(navigator.share)로 넘긴다. 모바일 브라우저(iOS Safari,
// 안드로이드 Chrome)에서 파일 공유를 지원하면 공유 시트에 인스타그램이
// 공유 대상으로 뜬다 — 인스타그램 전용 API/앱 시크릿이 따로 필요 없다.
// 지원하지 않는 환경(대부분의 데스크톱 브라우저)에서는 이미지를 대신
// 다운로드해줘서 수동으로 스토리에 올릴 수 있게 한다.
function drawShareCard(roundsCleared) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(540, 700, 100, 540, 960, 1400);
  grad.addColorStop(0, '#2a0f16');
  grad.addColorStop(0.55, '#160810');
  grad.addColorStop(1, '#050304');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 장식용 유리 파편 — crackLines.js와 같은 방사형 발상을 캔버스에 단순화해서 그림
  ctx.save();
  ctx.translate(540, 760);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const len = 210 + (i % 3) * 40;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
    ctx.stroke();
  }
  const ballGrad = ctx.createRadialGradient(-60, -70, 20, 0, 0, 260);
  ballGrad.addColorStop(0, '#ffd1ea');
  ballGrad.addColorStop(0.35, '#ff5fa8');
  ballGrad.addColorStop(1, '#b8125f');
  ctx.fillStyle = ballGrad;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.arc(0, 0, 230, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px "Space Grotesk", sans-serif';
  ctx.fillText('CRACK LAB', 540, 260);
  ctx.fillStyle = '#ff6b6b';
  ctx.font = '700 40px "Space Grotesk", sans-serif';
  ctx.fillText('CSL — CYBER STRESS LAB', 540, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 76px "Space Grotesk", sans-serif';
  ctx.fillText(`오늘 ${roundsCleared}번째`, 540, 1220);
  ctx.fillText('왁뿌볼 박살!', 540, 1310);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '500 38px "Space Grotesk", sans-serif';
  ctx.fillText('스트레스, 오늘도 다 깨버렸다', 540, 1400);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(280, 1560, 520, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px "Space Grotesk", sans-serif';
  ctx.fillText('LET IT OUT →', 540, 1628);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// 반환값: 'shared' | 'downloaded' | 'cancelled'
export async function shareToInstagramStory(roundsCleared) {
  const canvas = drawShareCard(roundsCleared);
  const blob = await canvasToBlob(canvas);
  if (!blob) return 'downloaded';

  const file = new File([blob], 'crack-lab.png', { type: 'image/png' });
  const shareData = {
    files: [file],
    title: 'CRACK LAB — CSL',
    text: '스트레스, 오늘도 다 깨버렸다 💥 CSL — Cyber Stress Lab',
  };

  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
      // 공유 시트 자체가 실패하면 다운로드로 대체
    }
  }

  downloadBlob(blob, 'crack-lab-share.png');
  return 'downloaded';
}
