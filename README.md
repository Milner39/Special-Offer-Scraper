# What Does It Do?

This application periodically scrapes 
[this](https://www.nhsfleetsolutions.co.uk/special-offers) site for car deals.

At the time of creating this repo, there is currently no way to set up alerts 
for car deals that I am interested in. So every 24 hours, this application uses 
[puppeteer](https://github.com/puppeteer/puppeteer) to scrape key information 
from the site.

There is also some pretty clever code to check which offers have been deleted or 
added to the site, preventing duplicate alerts. Hash Maps and Sets are used to 
get very solid time complexities.

Deals that are added can be:
- [X] Filtered
- [x] Sent to a recipient via email

You can also add your Fleet Solutions login details to a `.env` file and the 
scraper will log into your account and only show offers available specifically 
to your company.


## Prerequisites

* You must have a version of Chrome installed.

* You must have deno installed.

<br>

## How To Use

### Running

1.  Install dependencies with:
    ```bash
    pnpm i
    ```

<br>

2.  Rename `.env.example` to `.env` file in the project's root. You can check 
    what env options there are in the `env.ts` file.

<br>

3.  Start the application with:
    ```bash
    pnpm run start
    ```

<br>

### Compiling

1.  Compile the application with:
    ```bash
    pnpm run compile
    ```

<br>

2. Start the `scraper.exe` file however you like.

<br>

### Mail Alerts

Currently only gmail accounts are supported, if you want to receive emails when 
new offers are added:

1.  Create a gmail account (or use an existing one), and set up 2FA.

<br>

2.  Create an application password for the gmail account.

<br>

3.  Set the appropriate environment variables in the `.env` file.

<br>

A typical alert email looks like this:

<p align="center">
    <img src="https://github.com/user-attachments/assets/bedf2a69-e77b-464d-9f46-5eae8b021688">
</p>

