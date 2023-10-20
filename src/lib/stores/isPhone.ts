import { writable } from 'svelte/store';

const isPhoneStore = writable<boolean | null>(null);

function checkIsPhone() {
	// ストアの値を取得
	let isPhoneValue;

	const unsubscribe = isPhoneStore.subscribe(($isPhone) => {
		isPhoneValue = $isPhone;
	});

	if (isPhoneValue === null) {
		// ストアに値が保存されていない場合、navigatorオブジェクトが存在するか確認
		if (typeof navigator !== 'undefined') {
			isPhoneStore.set(!!navigator.userAgent.match(/iPhone|Android.+Mobile/));
			// 購読解除と値を返す
			unsubscribe();
			return isPhoneValue;
		} else {
			// 購読解除と値を返す
			unsubscribe();
			// navigatorオブジェクトが存在しない場合、ストアにはセットせずに、デフォルトの値を返す
			return true;
		}
	} else {
		//すでに保存されている場合その値を返す
		return isPhoneValue;
	}
}

export { checkIsPhone };
