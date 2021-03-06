class Panorama {
	// 初期設定
	constructor(){
		this.now_playing = false
		// playerを格納
		this.players = []
		// playerを格納している要素
		this.player_items = document.querySelectorAll("[data-player-item]")
		// player取得
		this.player_name = "[data-player]"
		// devicemotion（加速度取得）の許可フラグ
		this.edm_name = "[data-enable-devicemotion]"
		// 初期化の実行
		this.init()
	}

	init (){
		// player_itemsの取得確認
		if(this.player_items.length < 1){
				return false
		}
    
		// player_items数分だけ実行
		this.player_items.forEach(elements => {
			// player_name（playerそのもの）を取得
			const player_element = elements.querySelector(this.player_name)
			if(!player_element){
				return false
			}
			const player = videojs(player_element, {})
			this.players.push(player)

			const edm = elements.querySelector(this.edm_name)
			if (edm) {
				// iOSではないとき:edm非表示
				if(!this.isIOS()){
					edm.style.display = "none"
				}else{
					edm.addEventListener("click",() => {
						this.requestDeviceMotionPermission(player)
						player.play()
						edm.style.display = "none"
					})
				}
			}
			// ただ、このままだとページ内に複数動画を配置した際に動画がフルスクリーンでうまく機能しない時があります。
			// こちらは下記の通りフルスクリーンボタンを押した際にクラスを付与し、CSSで対応可能です。
			if (this.isIOS()) {
				player.controlBar.fullscreenToggle.on("tap", () => {
					if (!player.isFullscreen()) {
							player.el_.classList.add("is-fullscreen")
					} else {
							player.el_.classList.remove("is-fullscreen")
					}
				});
			}

			// panorama動作設定
			player.panorama({
				// クリックしてビデオを切り替える。ビデオが再生中:一時停止されます / 一時停止:再生
				clickToToggle: (!this.isMobile()),
				// モバイルデバイスでのみ機能。ユーザーが携帯電話を移動すると、360度ビデオが自動移動する
				autoMobileOrientation: true,
				// 視野の初期化？（公式ドキュメントに記載なし、数値を変更すると画面が逆さになったり、遠くなったり近くなる）
				initFov: 100,
				// clickAndDragがtrueに設定されている場合、ビデオの回転は、ユーザーがビデオをドラッグアンドドロップしたときにのみ発生
				clickAndDrag: true,
				// モバイルでのジャイロ速度制御（デフォルト iOS:0.022 / Android:1）
				mobileVibrationValue: 0.022,
				// 通知メッセージのカスタマイズ（前半:スマホ、後半:PC）
				NoticeMessage: (this.isMobile()) ? "please move your phone" : "please use your mouse drag and drop the video",
				// パノラマビデオの準備ができたときにコールバック関数が起動
				callback: () => {
					window.addEventListener("resize", () => {
						this.resize(player)
					})	
				}
			});      
                    
			player.on('play', () => {
				if(this.now_playing){
					this.now_playing.pause()
				}
				this.now_playing = player
			});
			player.on('pause', () => {
				if(this.now_playing == player){
					this.now_playing = false
				}
			});
		})
	} // 初期化終わり
            
	
	// iOS13からジャイロセンサーに対応するための devicemotion イベントに許可が必要
	// →DeviceMotionEvent.requestPermission() を実行する必要があるが、この機能自体がユーザーのクリックイベントにバインドしないと機能しない
	requestDeviceMotionPermission (player) {
		if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
			// 許可を取得
			DeviceMotionEvent.requestPermission().then(function (permissionState) {
				// 許可を得られた場合(granted:付与)、devicemotionをイベントリスナーに追加
				if (permissionState === 'granted') {
					window.addEventListener('devicemotion', (event) => {
						if(player){ 
							var canvas = player.getChild('Canvas');
							if(event.data){
								if (canvas) canvas.handleMobileOrientation(event.data.events);
							}
						}
					})
				} else {
					// 許可を得られなかった場合の処理
				}
			}).catch(console.error) // https通信でない場合などで許可を取得できなかった場合
		} else {
			// 上記以外のブラウザ
		}
	}

	
	// リサイズ
	resize (player){
		if( player ){
			const canvas = player.getChild('Canvas');
			canvas.handleResize();
		}
	}

	// モバイル判定
	isMobile() {
		let check = false;
		(function (a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
				check = true
		})
		(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	}
	// iOS判定
	isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent); }
}


document.addEventListener("DOMContentLoaded", () => {
	new Panorama
}) 