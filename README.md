# **Siang Sing Music**

An online ticketing system that allows users to see the current status of the seat while choosing a seat.

## **Test Accounts**
Website URL: https://siangsing-music.site
 * **Account 1**
    * Email: `user1@gmail.com`
    * Password: `12345`

* **Account 2**
    * Email: `user2@gmail.com`
    * Password: `12345`

* **Test Card**
    * Card Number: `4242 4242 4242 4242`
    * Exp. Date: `01/23`
    * CVV Code: `123`
## **Table of Contents**
* [Architecture](#Architecture)
* [Database Schema](#Database-Schema)
* [Features](#Features)
* [Technologies](#Technologies)
* [Loading Test](#Loading-Test)
* [Race Condition Cases](#Race-Condition-Cases)
* [Contact](#Contact)


## **Architecture**
![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/single.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T143838Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=37c81cabb44f74a4e30eb89956d26ae641af26f6cd05752dee6be56ad8dd43b5)


## **Database Schema**
![Database-Schema](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/ticketing_system_DB_schema.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T143919Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=524f29b11bc305bc1e3dcbbb31fd0daa0b7a2ac32f769cadcb66574f3a503c1c)


## **Features**
* ### **Choose a concert from the homepage**

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/homepage.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144031Z&X-Amz-SignedHeaders=host&X-Amz-Expires=299&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=fabe202851d686321517f453fbba31354a633da433341791b6d7bfda74e06673)

* ### **The seat status can be updated in real time**
    * Let users see the updated status of the seat in time when choosing a seat by **Socket&#46;IO**.

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/seat_status.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144109Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=8042e8f1110c747824abcd692ce6e9758eb086af3f2b2490b929aa288312bf0f)

* ### **Release seats that have not been added to the shopping cart**
    * To prevent the seat from being occupied, the system will release the seats that the user has selected but not added to the shopping cart when the user leaves the page.

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/release_ticket.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144157Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=4d6cbc947a018503e718a671879ead20a3b8983e5f5a09d31c26f052e1a21664)

* ### **Prevent two users choose the same seat at the same time**
    * Prevent overselling tickets for the same seat by **locking only affected rows** on table.

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/race_condition.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144304Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=6a61369c3582cdd1d523ef6199e8f66f57db8796670e14fe51b741b23ab22349)

* ### **Add the selected seat to the shopping cart**
    * In addition to adding the seat to the shopping cart after selecting the seat, you can also remove the seat on the shopping cart page.

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/add_to_cart.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144340Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=8e5f1526da323bcf0b389d77d42b40f45d76fa4322bd1f8b2d456b577c3830ea)

* ### **Check out and sent Email notification**
    * Connected to **third-party APIs (TayPay)**, which enables users to check out quickly.
    * Send an email notification to the user after the purchase is completed using **NodeMailer**.

    ![](https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/checkout_email.gif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144412Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=c7b9123bedcef59d55a53a2501a9a8afb13f862e2290937dba7d852ddd94c7a5)
<br/>

## **Technologies**
* ### **Back-End**
    * Node.js
    * Express.js

* ### **Front-End**
    * HTML 
    * CSS 
    * JavaScript + AJAX + jQuery

* ### **Database**
    * MySQL

* ### **Framework**
    * MVC design pattern

* ### **AWS Cloud Services**
    * Elastic Compute Cloud (EC2)
    * Elastic Load Balancing (ELB)
    * Relational Database Service (RDS)
    * Simple Storage Service (S3)
    * CloudFront

* ### **Networking**
    * HTTP & HTTPS
    * NGINX
    * SSL Certificate
    * Domain Name System (DNS)

* ### **Web Socket**
    * Socket&#46;IO

* ### **Test**
    * Mocha
    * Chai
    * Artillery

* ### **3rd Party API**
    * TapPay
<br/>

## **Loading Test**
* ### **Configuration**
  * Used Artillery for load testing. 
  * Compared the efficiency and cost of Horizontal Scaling (t2.micro *2) and Vertical Scaling (t2.medium *1).
  * The basic configuration is as follows:
   
<img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/configuration.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144447Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=3aa60fb60d0fef2434445560e85a5276a7bdec615772d74d3b2bf68eb4e81fd6" width="800"/>

* ### **CPU usage**
  Compare the CPU usage of **one t2.micro**, **Horizontal Scaling (two t2.micro)**, and **Vertical Scaling (one t2.medium)**, under different requests, as follows:
    * One t2.micro, when the number of requests reaches 150 req / sec, the CPU usage has already reached 83.34%.
    
    * The request limit of the two t2.micro and one t2.medium is almost the same (around 300 req/sec).

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/comparison_CPU_usage.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144529Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=83ec11c95efc529d8e3f4566f0ea7f7dd18ab279d360d3897f94a5686aa9c7a4" width="800"/>

* ### **Cost**
    Two t2.micro ($0.5484) costs less than one t2.medium ($0.5568), in the case of booting for 12 hours.

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/comparison_cost.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T144558Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=d8eb57761cf2ef2b64828a2a630c86ecf8d2f83f32aeeefc39554a23ff3075cf" width="800"/>

* ### **Conclution**
    Horizontal Scaling is scalable and more highly available than Vertical Scaling.
<br/>

## **Race Condition Cases**

* ### **Scenario: User A and User B choose the same seat.**

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/raceCondition_chooseSeat.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T142533Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=a991a9ab8fbd1808a170f104a704c97c5b7d093c99418a8c73c14032e98479cb"/>


* ### **Scenario: User A opens two pages to deselect the same seat at the same time.**

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/raceCondition_deleteSeat.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T143615Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=af4a31dc8c6f7d85a80e30b33e510de43ecde6f3f228c6b3068064317d5f2100"/>


* ### **Scenario: User A opens two pages to remove the same seat in the shopping cart at the same time.**

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/raceCondition_removeFormCart.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T143702Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=a580c205fc0b605208b3961b4862608d7ec11e0c82898f4099d430f7904eaa9a"/>

* ### **Scenario: User A open two pages checkout at the same time.**

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/raceCondition_checkout.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T143733Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=30187a0df2f2aa7b76795d44e08398b98b8e0ec605a72d03197d0bc2f0c6a36c"/>
<br/>

## **Contact**

* **Author:** <a href="https://github.com/singhuacai" target="_blank">Sing-Hua Cai</a>
* **Email:** singhuacai@gmail.com
