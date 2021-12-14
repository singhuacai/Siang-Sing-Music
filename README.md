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
![](https://drive.google.com/uc?export=view&id=18QZEAYITzA-l_UOXWAg1aGT3df7mA_6-)


## **Database Schema**
![Database-Schema](https://drive.google.com/uc?export=view&id=1PEGyI52HsnPan8fYFFKU4o7t2El8D_sM)


## **Features**
* ### **Choose a concert from the homepage**

    ![](https://drive.google.com/uc?export=view&id=1Nq7lJMuYLle1zOtJkuHzzZbEuJxN_H7a)

* ### **The seat status can be updated in real time**
    * Let users see the updated status of the seat in time when choosing a seat by **Socket&#46;IO**.

    ![](https://drive.google.com/uc?export=view&id=1aIq7ld55hwn9VY4mzFId0lPL2cljygJl)

* ### **Release seats that have not been added to the shopping cart**
    * To prevent the seat from being occupied, the system will release the seats that the user has selected but not added to the shopping cart when the user leaves the page.

    ![](https://drive.google.com/uc?export=view&id=1GMK175PPAmxXVJgeMyVdLsztLZnsly7D)

* ### **Prevent two users choose the same seat at the same time**
    * Prevent overselling tickets for the same seat by **locking only affected rows** on table.

    ![](https://drive.google.com/uc?export=view&id=1jMwmSKqfeUO28P6saNOSVH-kaV4NDLLP)

* ### **Add the selected seat to the shopping cart**
    * In addition to adding the seat to the shopping cart after selecting the seat, you can also remove the seat on the shopping cart page.

    ![](https://drive.google.com/uc?export=view&id=1Y4aDaoCFs9cBKeYYbISRNJeu7yvK9Fmk)

* ### **Check out and sent Email notification**
    * Connected to **third-party APIs (TayPay)**, which enables users to check out quickly.
    * Send an email notification to the user after the purchase is completed using **NodeMailer**.

    ![](https://drive.google.com/uc?export=view&id=1ejTeknXxVnN5k48dqfY_LSWnT5EJ8XGY)
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
   
<img src="https://drive.google.com/uc?export=view&id=10yCAh4UDJn8i1Gtyxez6nfDGFqUemKUg" width="800"/>

* ### **CPU usage**
  Compare the CPU usage of **one t2.micro**, **Horizontal Scaling (two t2.micro)**, and **Vertical Scaling (one t2.medium)**, under different requests, as follows:
    * One t2.micro, when the number of requests reaches 150 req / sec, the CPU usage has already reached 83.34%.
    
    * The request limit of the two t2.micro and one t2.medium is almost the same (around 300 req/sec).

    <img src="https://drive.google.com/uc?export=view&id=1y5lp5vNICogj4Mne-OGA2Bx01kL-HOWN" width="800"/>

* ### **Cost**
    Two t2.micro ($0.5484) costs less than one t2.medium ($0.5568), in the case of booting for 12 hours.

    <img src="https://drive.google.com/uc?export=view&id=1PmDmq9V0UO5WrmCS_wXl4WctRBH7lWEM" width="800"/>

* ### **Conclution**
    Horizontal Scaling is scalable and more highly available than Vertical Scaling.
<br/>

## **Race Condition Cases**

* ### **Scenario: User A and User B choose the same seat.**

    <img src="https://siang-sing-music-bucket.s3.us-east-2.amazonaws.com/raceCondition_chooseSeat.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHYaDmFwLW5vcnRoZWFzdC0yIkcwRQIhAPTGJAVjhNnDTwj7fTqC3iij4Uq7XZCqGoJSs%2F0liRknAiAeUBbOn4UcmwH%2FJakpVQCdwv7P4MVovoXMzOF4O5%2FT5Sr2AghfEAAaDDY0MTIzMjc2ODIzNSIMbAx41p%2FhGHiLYFM3KtMCbPNpRablkUHZ4uhFHiZ8qdLKAgtgwKShigo0x4YLoybg%2Fc3fGENK7ugynkU1G9rMLy7uQGdWSLXWFumvKFb0TeI7BH45R%2Fbm9T4C6HDpY%2Bp0Oz8nZ%2BioIDsOn1F1s4JtKO5HpMyouRGgAaYbZs8KmMFykA%2F9fE75CVOOgKw4CqfadKSyT%2BJKLbob%2BBRdmrxrIlsMXf7h0Tt%2BwoGblzYidmBpNuBG6CAyXKupB5D%2Fa9d2wfV6AQXTkmPrw%2B6RKarT3k%2FC24CEtts3RunmQ0mXb2zURgkwyMz4ogLcFlGNbf0twZrAdty2VWigZVhBdKqSKzYDWPYDp16YazDrpfDIQQKxQDWz7THssetL8FNW5shbQ1sChF6ja1Kok0kcRu2KRiMeVZLGO%2Fw1dxPoWSbT7L5XCha%2FzVAL0KWzIREZSwkixrXdpyr0%2F6uHvXg4qCX0wFL1MN7K4o0GOrMCo6Jn3wADn9nEbTboHKL9Ucg%2FJ1GI16hDe3DO%2BaWWKi3Nm0W%2B5Z70uutkWhoSJh%2BlmdzFmw%2FYMBQWT0nKk8NijPPObmV5d7MHx7q24Ww5eR8UH7SYA%2FWli2I%2BLE%2Foa2HmIYsVXAwVO9nbUDDcAv0is4TaRnubH3x%2BqxMIGDWZckrDHztbh9c1c7IgjDg6ihN4J7DcAa38cr6dgcM%2B6p5dhyGMxbqGkMxdZQQZ3mVzajM5e7bwZw3jvoaKTrtYHNaSx2vQ%2F7TxP4nVbBsfO%2FPJkbBB0b9x62a84vzV66NX2vVNzTgQ8dv4TwgkoKuBtWInNLn9bWvUxsjzJSA2GN3gNnhXmJrefiHNHo4thzxYaFgt1QzGR3%2BK%2BLsebsNABrjHtMaikft7wvSQY%2FPXRLkzKQ3zvQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211214T142533Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZKTDTRTVZNYAOCXK%2F20211214%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=a991a9ab8fbd1808a170f104a704c97c5b7d093c99418a8c73c14032e98479cb"/>


* ### **Scenario: User A opens two pages to deselect the same seat at the same time.**

    <img src="https://drive.google.com/uc?export=view&id=17VPVSKq9-0X2WEgoNG0QPmG_X9Se9QUQ"/>


* ### **Scenario: User A opens two pages to remove the same seat in the shopping cart at the same time.**

    <img src="https://drive.google.com/uc?export=view&id=1guRTL7yzoVK0qZ40Z02cwOy-9w4DhWUg"/>

* ### **Scenario: User A open two pages checkout at the same time.**

    <img src="https://drive.google.com/uc?export=view&id=1OcVfl0RnjjKS9WBbK7k5vgVg0DT-Vm3k"/>
<br/>

## **Contact**

* **Author:** <a href="https://github.com/singhuacai" target="_blank">Sing-Hua Cai</a>
* **Email:** singhuacai@gmail.com
