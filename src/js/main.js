const modal = document.querySelector('.modal')
const modalLocation = document.querySelector('.modal__location')
const closeButton = document.querySelector('.modal__close-btn')
const myForm = document.querySelector('.form')
const addButton = document.querySelector('.form__button')
const messages = document.querySelector('.modal__messages')
const [name, place, text] = myForm.elements

ymaps.ready(init)

function init () {
    const myMap = new ymaps.Map('map', {
        center: [55.77373784, 37.62174968],
        zoom: 14,
        controls: ['geolocationControl', 'zoomControl']
    })

    let coordinates
    const placemarks = []

    const clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedOrangeClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 150,
        clusterBalloonPagerType: 'marker'
    })

    const showModal = () => {
        if (!modal.classList.contains('modal__show')) {
            modal.classList.add('modal__show')
            modal.style.top = event.clientY + 'px'
            modal.style.left = event.clientX + 'px'
        }
    }

    const hideModal = () => {
        modal.classList.remove('modal__show')
    }

    const getCoords = (event) => {
        return event.get('coords')
    }

    const createPlacemark = () => {
        const date = new Date()
        const currentTime = date.toLocaleTimeString()
        const currentDate = date.toLocaleDateString()

        const newPlacemark = new ymaps.Placemark(
            coordinates,
            {
                balloonContentHeader: place.value,
                balloonContentBody: `<a class="link">${modalLocation.innerText}</a><br><br>${text.value}<br>`,
                balloonContentFooter: currentTime + ' ' + currentDate
            },
            {
                preset: 'islands#orangeIcon',
                draggable: false,
                openBalloonOnClick: false
            }
        )

        newPlacemark.commentContent =
      `<div><span><b>${name.value}</b></span>
            <span>${place.value}</span>
            <span>${currentTime}</span><br>
            <span>${text.value}</span></div>`

        messages.innerHTML += newPlacemark.commentContent
        newPlacemark.place = modalLocation.innerText

        return newPlacemark
    }

    const clearInputs = () => {
        name.value = ''
        place.value = ''
        text.value = ''
    }

    const showCurrentModal = () => {
        messages.innerHTML = ''
        modalLocation.innerHTML = ''
        const link = document.querySelector('.link')

        placemarks.forEach((el) => {
            if (el.place === link.textContent) {
                modalLocation.innerText = el.place
                messages.innerHTML += el.commentContent
            }
        })
        showModal()
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('link')) {
            showCurrentModal()
        }
    })

    const getAdress = async (coords) => {
        try {
            const myGeocoder = await ymaps.geocode([coords])
            const adress = myGeocoder.geoObjects.get(0)

            modalLocation.textContent = adress.getAddressLine()
        } catch (error) {
            console.log('Произошла ошибка: ' + error)
        }
    }

    myMap.events.add('click', (e) => {
        if (modal.classList.contains('modal__show')) {
            hideModal()
        } else {
            messages.innerHTML = ''
            coordinates = getCoords(e)
            getAdress(coordinates)
            showModal()
        }
    })

    addButton.addEventListener('click', (e) => {
        e.preventDefault()

        if (name.value && place.value && text.value) {
            const newPlacemark = createPlacemark()

            myMap.geoObjects.add(newPlacemark)
            clusterer.add(newPlacemark)
            placemarks.push(newPlacemark)

            newPlacemark.events.add('click', () => {
                showModal()
                messages.innerHTML = newPlacemark.commentContent
                modalLocation.innerText = newPlacemark.place
            })

            clearInputs()
        } else {
            alert('Заполните все поля!')
        }
    })

    closeButton.addEventListener('click', () => hideModal())

    clusterer.add(placemarks)
    myMap.geoObjects.add(clusterer)
}
