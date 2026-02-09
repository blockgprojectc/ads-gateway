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
    document.getElementById('loader').classList.remove('hidden');
    window.open(MAIN_AD_LINK, '_blank');

    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        callback();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
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
    document.getElementById('loader').classList.remove('hidden');
    window.open(adLink, '_blank');
    setTimeout(() => {
        window.location.href = videoUrl;
    }, 3000);
}

// ==========================================
// RENDER ENGINE
// ==========================================
function render() {
    const grid = document.getElementById('video-grid');
    const pagin = document.getElementById('pagination');
    const query = document.getElementById('searchInput').value.toLowerCase();

    const filtered = videoData.filter(v => {
        const matchesCat = activeCategory === 'all' || v.category === activeCategory;
        const matchesSearch = v.title.toLowerCase().includes(query);
        return matchesCat && matchesSearch;
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
        grid.innerHTML = currentVideos.map(v => `
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
                    <button class="btn-theory w-full py-4 bg-[#FACC15] text-black rounded-2xl font-black text-xs uppercase tracking-widest">Ring to Watch</button>
                </div>
            </div>
        `).join('');
    }

    pagin.innerHTML = totalPages <= 1 ? "" : Array.from({ length: totalPages }, (_, i) => i + 1).map(num => `
        <button onclick="setPage(${num})" 
            class="btn-theory w-14 h-14 rounded-2xl font-bold text-sm ${currentPage === num ? 'bg-[#FACC15] text-black shadow-lg shadow-[#FACC15]/40' : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-[#FACC15]'}">
            ${num}
        </button>
    `).join('');

    ['all', 'new', 'top'].forEach(cat => {
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
