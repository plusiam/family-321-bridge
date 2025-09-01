// 캔버스 그리기 설정
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentColor = '#000000';
let currentMode = 'draw';

// 캔버스 크기 조정
function resizeCanvas() {
    const container = document.getElementById('drawing-container');
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width - 6);
    canvas.width = width;
    canvas.style.width = width + 'px';
    
    // 모바일에서는 높이를 조절
    if (window.innerWidth < 768) {
        canvas.height = 150;
        canvas.style.height = '150px';
    }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
setTimeout(resizeCanvas, 100);

// 그리기 이벤트
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// 터치 이벤트 (태블릿/모바일)
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
        stopDrawing();
        return;
    }
    
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 
        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// 색상 변경
document.getElementById('colorPicker').addEventListener('change', (e) => {
    currentColor = e.target.value;
});

// 캔버스 지우기
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToLocalStorage();
}

// 모드 전환 (그리기/사진)
function setMode(mode) {
    currentMode = mode;
    const drawBtn = document.getElementById('drawModeBtn');
    const photoBtn = document.getElementById('photoModeBtn');
    const drawContainer = document.getElementById('drawing-container');
    const photoContainer = document.getElementById('photo-container');
    
    if (mode === 'draw') {
        drawBtn.classList.add('selected', 'bg-purple-500', 'text-white');
        drawBtn.classList.remove('bg-gray-300', 'text-gray-700');
        photoBtn.classList.remove('selected', 'bg-purple-500', 'text-white');
        photoBtn.classList.add('bg-gray-300', 'text-gray-700');
        
        drawContainer.classList.remove('hidden');
        photoContainer.classList.add('hidden');
    } else {
        photoBtn.classList.add('selected', 'bg-purple-500', 'text-white');
        photoBtn.classList.remove('bg-gray-300', 'text-gray-700');
        drawBtn.classList.remove('selected', 'bg-purple-500', 'text-white');
        drawBtn.classList.add('bg-gray-300', 'text-gray-700');
        
        photoContainer.classList.remove('hidden');
        drawContainer.classList.add('hidden');
    }
    saveToLocalStorage();
}

// 사진 업로드 처리
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadPrompt = document.getElementById('uploadPrompt');
            const photoPreview = document.getElementById('photoPreview');
            const uploadedPhoto = document.getElementById('uploadedPhoto');
            
            uploadedPhoto.src = e.target.result;
            uploadPrompt.classList.add('hidden');
            photoPreview.classList.remove('hidden');
            
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

// 사진 제거
function removePhoto() {
    const uploadPrompt = document.getElementById('uploadPrompt');
    const photoPreview = document.getElementById('photoPreview');
    const uploadedPhoto = document.getElementById('uploadedPhoto');
    const photoInput = document.getElementById('photoInput');
    
    uploadedPhoto.src = '';
    photoInput.value = '';
    uploadPrompt.classList.remove('hidden');
    photoPreview.classList.add('hidden');
    
    saveToLocalStorage();
}

// 주제 선택
function setTopic(topic) {
    document.getElementById('topic').value = topic;
    document.querySelectorAll('.choice-btn').forEach(btn => {
        if (btn.textContent.includes('우리 가족') || btn.textContent.includes('가족이') || btn.textContent.includes('행복한')) {
            btn.classList.remove('selected');
            if (btn.textContent.trim() === topic) {
                btn.classList.add('selected');
            }
        }
    });
    saveToLocalStorage();
}

// 느낌 선택
function selectFeeling(button, emoji) {
    // 이모지 버튼만 선택 해제
    button.parentElement.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    document.getElementById('selected-feeling').value = emoji;
    
    // 스탬프 효과
    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    stamp.textContent = emoji;
    stamp.style.left = '50%';
    stamp.style.top = '-50px';
    stamp.style.transform = 'translateX(-50%)';
    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(stamp);
    setTimeout(() => stamp.remove(), 1000);
    
    saveToLocalStorage();
}

// 완성 축하
function completeWorksheet() {
    const modal = document.getElementById('congratsModal');
    const content = document.getElementById('congratsContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.style.transform = 'scale(1)';
    }, 100);
}

function closeCongratsModal() {
    const modal = document.getElementById('congratsModal');
    const content = document.getElementById('congratsContent');
    content.style.transform = 'scale(0)';
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 로컬 스토리지 저장
function saveToLocalStorage() {
    const data = {};
    document.querySelectorAll('input[data-field]').forEach(input => {
        data[input.dataset.field] = input.value;
    });
    
    // 학생 정보 저장
    ['grade', 'class', 'number', 'name', 'topic'].forEach(id => {
        const element = document.getElementById(id);
        if (element) data[id] = element.value;
    });
    
    // 현재 모드 저장
    data.mode = currentMode;
    
    // 캔버스 저장
    try {
        data.drawing = canvas.toDataURL();
    } catch (e) {
        console.log('Canvas save failed:', e);
    }
    
    // 업로드된 사진 저장
    const uploadedPhoto = document.getElementById('uploadedPhoto');
    if (uploadedPhoto && uploadedPhoto.src && uploadedPhoto.src !== window.location.href) {
        data.uploadedPhoto = uploadedPhoto.src;
    }
    
    localStorage.setItem('321-bridge-elementary-responsive', JSON.stringify(data));
}

// 로컬 스토리지에서 불러오기
function loadFromLocalStorage() {
    const saved = localStorage.getItem('321-bridge-elementary-responsive');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            // 필드 복원
            Object.keys(data).forEach(key => {
                if (key === 'drawing' && data[key]) {
                    // 캔버스 복원
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = data[key];
                } else if (key === 'uploadedPhoto' && data[key]) {
                    // 업로드된 사진 복원
                    const uploadPrompt = document.getElementById('uploadPrompt');
                    const photoPreview = document.getElementById('photoPreview');
                    const uploadedPhoto = document.getElementById('uploadedPhoto');
                    
                    uploadedPhoto.src = data[key];
                    uploadPrompt.classList.add('hidden');
                    photoPreview.classList.remove('hidden');
                } else if (key === 'mode' && data[key]) {
                    // 모드 복원
                    setMode(data[key]);
                } else {
                    const element = document.querySelector(`[data-field="${key}"]`) || 
                                  document.getElementById(key);
                    if (element) element.value = data[key];
                }
            });
        } catch (e) {
            console.log('Load failed:', e);
        }
    }
}

// 모든 입력에 저장 이벤트 추가
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', saveToLocalStorage);
    input.addEventListener('change', saveToLocalStorage);
});

// 이미지로 저장
async function saveAsImage() {
    const captureArea = document.getElementById('capture-area');
    const buttons = document.querySelector('footer');
    buttons.style.display = 'none';
    
    try {
        const canvas = await html2canvas(captureArea, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });
        
        const link = document.createElement('a');
        const studentName = document.getElementById('name').value || '학생';
        const date = new Date().toISOString().split('T')[0];
        link.download = `우리가족_321_${studentName}_${date}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        // 완료 메시지
        completeWorksheet();
    } catch (error) {
        console.error('이미지 저장 실패:', error);
        alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
        buttons.style.display = '';
    }
}

// 인쇄 기능
function printWorksheet() {
    window.print();
}

// 초기화
function resetAll() {
    if (confirm('모든 내용을 지우고 다시 시작할까요?')) {
        document.querySelectorAll('input').forEach(input => {
            if (input.id !== 'grade') {
                input.value = '';
            }
        });
        clearCanvas();
        removePhoto();
        document.querySelectorAll('.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        localStorage.removeItem('321-bridge-elementary-responsive');
    }
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    resizeCanvas();
});