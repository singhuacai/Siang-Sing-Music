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
![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/single.png)


## **Database Schema**
![Database-Schema](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/ticketing_system_DB_schema.png)


## **Features**
* ### **Choose a concert from the homepage**

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/homepage.gif)

* ### **The seat status can be updated in real time**
    * Let users see the updated status of the seat in time when choosing a seat by **Socket&#46;IO**.

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/seat_status.gif)

* ### **Release seats that have not been added to the shopping cart**
    * To prevent the seat from being occupied, the system will release the seats that the user has selected but not added to the shopping cart when the user leaves the page.

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/release_ticket.gif)

* ### **Prevent two users choose the same seat at the same time**
    * Prevent overselling tickets for the same seat by **locking only affected rows** on table.

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/race_condition.gif)

* ### **Add the selected seat to the shopping cart**
    * In addition to adding the seat to the shopping cart after selecting the seat, you can also remove the seat on the shopping cart page.

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/add_to_cart.gif)

* ### **Check out and sent Email notification**
    * Connected to **third-party APIs (TayPay)**, which enables users to check out quickly.
    * Send an email notification to the user after the purchase is completed using **NodeMailer**.

    ![](https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/checkout_email.gif)
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
   
<img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/configuration.png" width="800"/>

* ### **CPU usage**
  Compare the CPU usage of **one t2.micro**, **Horizontal Scaling (two t2.micro)**, and **Vertical Scaling (one t2.medium)**, under different requests, as follows:
    * One t2.micro, when the number of requests reaches 150 req / sec, the CPU usage has already reached 83.34%.
    
    * The request limit of the two t2.micro and one t2.medium is almost the same (around 300 req/sec).

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/comparison_CPU_usage.png" width="800"/>

* ### **Cost**
    Two t2.micro ($0.5484) costs less than one t2.medium ($0.5568), in the case of booting for 12 hours.

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/comparison_cost.png" width="800"/>

* ### **Conclution**
    Horizontal Scaling is scalable and more highly available than Vertical Scaling.
<br/>

## **Race Condition Cases**

* ### **Scenario: User A and User B choose the same seat.**

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/raceCondition_chooseSeat.png"/>


* ### **Scenario: User A opens two pages to deselect the same seat at the same time.**

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/raceCondition_deleteSeat.png"/>


* ### **Scenario: User A opens two pages to remove the same seat in the shopping cart at the same time.**

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/raceCondition_removeFormCart.png"/>

* ### **Scenario: User A open two pages checkout at the same time.**

    <img src="https://raw.githubusercontent.com/singhuacai/Siang-Sing-Music/testing/readme_img/raceCondition_checkout.png"/>
<br/>

## **Contact**

* **Author:** <a href="https://github.com/singhuacai" target="_blank">Sing-Hua Cai</a>
* **Email:** singhuacai@gmail.com