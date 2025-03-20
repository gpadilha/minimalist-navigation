class Navigation {
	// ideally these timezones would be on the json then set to the html data-timezone attribute
	SectionToTimezone = {
		cupertino: 'America/Los_Angeles',
		'new-york-city': 'America/New_York',
		london: 'Europe/London',
		amsterdam: 'Europe/Amsterdam',
		tokyo: 'Asia/Tokyo',
		'hong-kong': 'Asia/Hong_Kong',
		sydney: 'Australia/Sydney',
	};

	constructor(el, clockEl = null) {
		// init clock attributes
		this.clock = clockEl;
		this.clockInterval = null;
		this.initClock();

		// init nav attributes
		this.root = el;
		this.nav = null;
		this.highlighter = null;
		this.prevAnimation = {
			from: '50%',
			sizeFrom: '100px',
		};
		this.initializeNav();
	}

	initClock() {
		if (!this.clock) return;
		this.clock.classList.add('styled-clock');
	}

	async initializeNav() {
		try {
			let citiesJson = await (await fetch('navigation.json')).json();

			const navItems = document.createElement('ul');
			navItems.classList.add('navigation');
			this.nav = navItems;

			citiesJson.cities.forEach((c) => {
				let item = document.createElement('li');
				item.innerText = c.label;
				item.id = c.section;
				item.setAttribute('data-section', c.section);
				item.classList.add('navigation-item');
				item.addEventListener('click', this);
				navItems.append(item);
			});
			this.root.classList.add('navigation-wrapper');
			this.root.append(navItems);

			this.highlighter = document.createElement('span');
			this.highlighter.classList.add('navigation-active-underline');
			this.root.append(this.highlighter);

			window.addEventListener('resize', this);
		} catch (err) {
			console.error('Error initializing navigation component', err);
		}
	}

	handleEvent(e) {
		if (e.type === 'click') this.activeItem(e.target);
		if (e.type === 'resize') this.handleResize(e.target);
	}

	handleResize() {
		this.animateActive();
	}

	activeItem(source) {
		for (let el of this.nav.childNodes) {
			if (el.classList.contains('active')) {
				el.classList.remove('active');
				break;
			}
		}
		source.classList.add('active');
		this.active = source;
		this.refreshClock();
		this.animateActive();
	}

	animateActive() {
		let start = this.root.offsetLeft;
		let leftTo = `${start + this.active.offsetLeft}px`;
		let widthTo = `${this.active.offsetWidth}px`;

		this.highlighter.animate(
			[
				{
					left: this.prevAnimation.from,
					width: this.prevAnimation.sizeFrom,
				},
				{
					left: leftTo,
					width: widthTo,
				},
			],
			{ duration: 300 }
		);

		this.highlighter.style.left = leftTo;
		this.highlighter.style.width = widthTo;

		// replace from values so it is ready for next time
		this.prevAnimation.from = leftTo;
		this.prevAnimation.sizeFrom = widthTo;
	}

	refreshClock() {
		if (!this.clock) return;
		if (this.clockInterval) clearInterval(this.clockInterval);

		let tz = this.SectionToTimezone[this.active.dataset.section];
		if (!tz) {
			this.clock.innerText = '';
			return;
		}

		this.clockInterval = setInterval(() => {
			const now = new Date().toLocaleString(navigator.language, {
				timeZone: tz,
			});
			this.clock.innerText = now;
		}, 1000);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new Navigation(document.getElementById('my-nav'), document.getElementById('my-clock'));
});
