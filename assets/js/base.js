const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'BUITHIENDEV'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const btnNext = $('.btn-next')
const btnPrev = $('.btn-prev')
const randBtn = $('.btn-random')
const reBtn = $('.btn-repeat')
const playlist = $('.playlist')
let listRandom= []

const app = {
    isPlaying: false,
    isRandom: false,
    isReplay: false,
    currentIndex: 0,
    indexOld: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [ 
            {
            name: "爱你到最后一刻",
            singer: "Mạc Tỷ Tỷ",
            path: "./assets/music/YeuAnhDenKhoanhKhacCuoiCung - Mac.mp3",
            image:"./assets/img/Song1.png"
            },
            {
              name: "Hẹn ước từ hư vô",
              singer: "Mỹ Tâm",
              path: "./assets/music/Henuoctuhuvo.mp3",
              image:"./assets/img/Song2.png"
            },
            {
              name: "Đường tôi chở em về",
              singer: "Builinhtruong",
              path: "./assets/music/Duong Toi Cho Em Ve Lofi Version_ - buit.mp3",
              image: "./assets/img/Song3.png"
            },
            {
              name: "Mashup A B C D,Star",
              singer: " Changmie x Tiến Tới",
              path: "./assets/music/MashupABCD.mp3",
              image:"./assets/img/Song4.png"
            },
            {
                name: "没有你陪伴真的好孤单",
                singer: "Mộng Nhiên",
                path: "./assets/music/Khong Co Anh Ben Canh Em That Su Rat Co.mp3",
                image:"./assets/img/Song5.jpeg"
            },
            {
              name: "Making A Lover",
              singer: "Making A Lover",
              path: "./assets/music/MakingALover.mp3",
              image:"./assets/img/Song6.png"
            },
            {
                name: " 醒不来的梦",
                singer: "Thập Nhị",
                path: "./assets/music/GiacMoKhongTheDanhThuc.mp3",
                image:"./assets/img/Song7.png"
            } 
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map(function(song,index) {
            return `
            <div class ="song" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
            </div>    
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties:function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this;
        //scrollTop
        const cdWidth = cd.offsetWidth
        document.onscroll = () => {
            const scrollTop = window.scrollY
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth < 0 ? 0 : newCdWidth + 'px';
            cd.style.opacity = newCdWidth/cdWidth;
        }
        // Xử lí CD quay

        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // xử lí click play/pause
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play();
            }
        }
        // lắng nghe bài hát đang phát
        audio.onplay =function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play();
        }
        // lắng nghe bài hát đang dừng
        audio.onpause =function() {
            _this.isPlaying = false 
            cdThumbAnimate.pause();
            player.classList.remove('playing')
        }
        // Tiến độ bài hát thay đổi
        audio.ontimeupdate =function() {
            if(audio.duration) {
                const progressPercent = audio.currentTime/audio.duration *100;
                progress.value = progressPercent
            }
        }

        // Xử lý tua bài hát
        progress.onchange =function(e) {
            const seekTime =  (e.target.value/100)*audio.duration
            audio.currentTime = seekTime;
        }

        //Xử lí next bài hát
        btnNext.onclick =function() {
            if(_this.isRandom){
                _this.randomSong();
                _this.loadCurrentSong()
            }
            else {
                _this.nextSong();
            }
            _this.scrollToActiveSong();
            _this.activeSongPresent();

        }

        //Xử lí lùi bài hát
        btnPrev.onclick =function() {
            _this.prevSong();
            _this.activeSongPresent();
            _this.scrollToActiveSong();
        }

        //Xử lí random bài hát
        randBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom",_this.isRandom);
            randBtn.classList.toggle('active',_this.isRandom);
        }

        //Xử lí replay bài hát
        reBtn.onclick = function() {
            _this.isReplay = !_this.isReplay;
            _this.setConfig("isReplay",_this.isReplay)
            reBtn.classList.toggle('active',_this.isReplay)
        }

        // Xử lí khi hết bài hát
        audio.onended = function() {
            if(_this.isReplay){
                audio.currentTime=0
                _this.loadCurrentSong() 
            }
            else 
                btnNext.click();
        }

        //Xử lí chuyển bài hát khác khi click 
        playlist.onclick = function(e) {
            const songTar = e.target.closest('.song:not(.active)')
            if(songTar || !e.target.closest('.options')) {
                if(songTar) {
                    const data_id = songTar.dataset.index
                    _this.currentIndex = data_id
                    _this.loadCurrentSong();
                    _this.activeSongPresent();
                }
            }
        }
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isReplay = this.config.isReplay
        reBtn.classList.toggle('active',this.isReplay)
        randBtn.classList.toggle('active',this.isRandom);
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        },100)
    },

    randomSong: function() {
        listRandom = listRandom.length==this.songs.length?[]:listRandom;
        let rand
        do {
            rand = Math.floor(Math.random() * this.songs.length)
        } while(rand == this.currentIndex || listRandom.includes(rand))
        this.currentIndex = rand;
        listRandom.push(rand);
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length)
            this.currentIndex=0
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex <0)
            this.currentIndex = this.songs.length-1;
        this.loadCurrentSong();
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        audio.play()
            .catch(function(){
                this.currentIndex++;
            })
    },

    activeSongPresent: function() {
        const nthChild = $(`[data-index="${this.currentIndex}"]`)
        if(this.currentIndex!=this.indexOld) {
            var nthOldChild =  $(`[data-index="${this.indexOld}"]`)
            this.indexOld = this.currentIndex;
            nthOldChild.classList.remove('active')
        }
        nthChild.classList.add('active')
    },

    start: function() {
        // Render list music
        this.render();

        // Định nghĩa các thuộc tính
        this.defineProperties();

        // lắng nghe và xử lý sự kiện
        this.handleEvents();

        // Load info music from UI
        this.loadCurrentSong();

        // load setting user
        this.loadConfig()

    }
}

app.start();

