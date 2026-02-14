// ==========================================
// CONFIGURATION
// ==========================================

const MAIN_AD_LINK = "https://www.effectivegatecpm.com/sgk1tgjk7t?key=953a6ee48286b155821c80a7c50d853b";

let videoData = [];
let currentPage = 1;
let activeCategory = 'all';
const itemsPerPage = 6;

// Fetch Data from JSON
fetch('videos.json')
    .then(response => response.json())
    .then(data => {
        videoData = data;
        render();
    })
    .catch(error => console.error('Error loading videos:', error));

// ==========================================
// ACTION THEORY ENGINE
// ==========================================
function runTheoryAction(callback) {
    window.open(MAIN_AD_LINK, '_blank');
    callback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setCategory(cat) {
    runTheoryAction(() => {
        activeCategory = cat;
        currentPage = 1; // Back to first page logic
        render();
    });
}

function setPage(num) {
    runTheoryAction(() => {
        currentPage = num;
        render();
    });
}

function playVideo(adLink, videoUrl) {
    window.open(adLink, '_blank');
    window.location.href = videoUrl;
}

function openCollection(id) {
    const item = videoData.find(v => v.id === id);
    if (!item) return;

    const modal = document.getElementById('series-modal');
    const title = document.getElementById('modal-title');
    const partsContainer = document.getElementById('modal-parts');

    title.innerText = item.title;
    partsContainer.innerHTML = item.parts.map(p => `
        <div onclick="playVideo('${p.ad || MAIN_AD_LINK}', '${p.video}')" class="group cursor-pointer bg-neutral-900/60 rounded-3xl overflow-hidden border border-white/5 hover:border-[#FACC15] transition-all p-4 flex gap-4">
            <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img src="${p.thumb}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
            <div class="flex flex-col justify-center">
                <h4 class="font-bold text-white mb-2 line-clamp-2">${p.title}</h4>
                <span class="text-[10px] font-black uppercase text-[#FACC15] tracking-[.2em]">Watch Now</span>
            </div>
        </div>
    `).join('');

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeCollection() {
    document.getElementById('series-modal').classList.add('hidden');
}

// ==========================================
// RENDER ENGINE
// ==========================================
let slideIntervals = {};

function render() {
    const grid = document.getElementById('video-grid');
    const pagin = document.getElementById('pagination');

    // Clear existing intervals
    Object.values(slideIntervals).forEach(clearInterval);
    slideIntervals = {};

    const filtered = videoData.filter(v => {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'new') {
            if (!v.upload_date) return false;
            const uploadTime = new Date(v.upload_date).getTime();
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            return uploadTime > sevenDaysAgo;
        }
        if (activeCategory === 'long') {
            if (v.type === 'collection') return false; // Collections don't have duration at top level
            return v.duration && v.duration > 900;
        }
        return v.category === activeCategory;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentVideos = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (currentVideos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="bg-neutral-900/50 rounded-[3rem] p-12 border border-dashed border-neutral-800">
                    <i data-lucide="video-off" class="w-16 h-16 text-neutral-600 mx-auto mb-6"></i>
                    <h3 class="text-2xl font-bold text-neutral-400 mb-2">No videos found</h3>
                    <p class="text-neutral-500">Upload content via the bot to see it here.</p>
                </div>
            </div>
        `;
    } else {
        grid.innerHTML = currentVideos.map(v => {
            if (v.type === 'collection') {
                const partsThumbs = v.parts.map(p => p.thumb);
                const slideId = `slide-${v.id}`;

                // Set interval for sliding
                setTimeout(() => {
                    let currentSlide = 0;
                    const el = document.getElementById(slideId);
                    if (!el) return;

                    slideIntervals[v.id] = setInterval(() => {
                        currentSlide = (currentSlide + 1) % partsThumbs.length;
                        el.style.transform = `translateX(-${currentSlide * 100}%)`;
                    }, 3000);
                }, 100);

                return `
                    <div onclick="openCollection('${v.id}')" class="group cursor-pointer bg-neutral-900/40 rounded-[2rem] overflow-hidden border border-neutral-800 hover:border-[#FACC15] transition-all duration-500">
                        <div class="relative aspect-video overflow-hidden">
                            <div id="${slideId}" class="flex w-full h-full transition-transform duration-1000 ease-in-out">
                                ${v.parts.map(p => `<img src="${p.thumb}" class="w-full h-full object-cover flex-shrink-0">`).join('')}
                            </div>
                            <div class="absolute top-4 left-4 bg-[#FACC15] text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10">Collection</div>
                            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                        </div>
                        <div class="p-8">
                            <h3 class="font-bold text-xl text-white mb-6 break-words whitespace-normal">${v.title}</h3>
                            <div class="flex items-center gap-3 text-neutral-500 mb-6 font-bold text-xs uppercase tracking-tighter">
                                <i data-lucide="layers" class="w-4 h-4"></i>
                                <span>${v.parts.length} VIDEOS INSIDE</span>
                            </div>
                            <button class="btn-theory w-full py-4 bg-[#FACC15] text-black rounded-2xl font-black text-xs uppercase tracking-widest">Explore Series</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div onclick="playVideo('${v.ad}', '${v.video}')" class="group cursor-pointer bg-neutral-900/40 rounded-[2rem] overflow-hidden border border-neutral-800 hover:border-[#FACC15] transition-all duration-500">
                    <div class="relative aspect-video overflow-hidden">
                        <img src="${v.thumb}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <div class="bg-[#FACC15] p-5 rounded-full scale-0 group-hover:scale-100 transition-all duration-500 shadow-2xl shadow-[#FACC15]/50">
                                <i data-lucide="play" class="text-black fill-current w-6 h-6"></i>
                            </div>
                        </div>
                    </div>
                    <div class="p-8">
                        <h3 class="font-bold text-xl text-white mb-6 break-words whitespace-normal">${v.title}</h3>
                        <button class="btn-theory w-full py-4 bg-[#FACC15] text-black rounded-2xl font-black text-xs uppercase tracking-widest">Watch</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    pagin.innerHTML = totalPages <= 1 ? "" : Array.from({ length: totalPages }, (_, i) => i + 1).map(num => `
        <button onclick="setPage(${num})" 
            class="btn-theory w-14 h-14 rounded-2xl font-bold text-sm ${currentPage === num ? 'bg-[#FACC15] text-black shadow-lg shadow-[#FACC15]/40' : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-[#FACC15]'}">
            ${num}
        </button>
    `).join('');

    ['all', 'new', 'long'].forEach(cat => {
        const btn = document.getElementById(`btn-${cat}`);
        if (cat === activeCategory) {
            btn.className = "btn-theory px-10 py-3.5 rounded-2xl font-bold text-sm bg-[#FACC15] text-black shadow-lg shadow-[#FACC15]/40";
        } else {
            btn.className = "btn-theory px-10 py-3.5 rounded-2xl font-bold text-sm bg-neutral-900 text-neutral-400 hover:text-black hover:bg-[#FACC15]";
        }
    });

    lucide.createIcons();
}

// Initial render handled by fetch response, but good to have fallback if needed
// render();
