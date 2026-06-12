# SPENDGER

> Spendger is a zero-login, privacy-first local app that auto-tracks your expenses via notifications and includes a smart pre-payment calculator that deep-links directly into UPI apps.

---

## Table of Contents

1. Overview
2. Problem Statement

## Overview

Spendger is a smart, privacy-first mobile app that changes how you track money and make payments. It combines a smart calculator with an automatic expense tracker that runs completely on your own phone—no accounts, no internet servers, and no logins required.

**Product Summary:**  
Spendger is an expense tracker for Gen Z that automatically records UPI payments from apps like Google Pay, PhonePe, and Paytm. It also includes a Calculator + Pay feature that lets users calculate an amount and pay through any installed UPI app. The goal is to make expense tracking effortless by capturing spending automatically in the background.

## Problem Statement

As Gen Z, we use UPI for almost every payment—tea, food, shopping, subscriptions, and splitting bills with friends. We want to track where our money goes, but we don’t want to put in extra effort by manually recording every expense.

Most of the time, we pay through apps like Google Pay, PhonePe, and Paytm, but then forget to log those payments in an expense tracker. Over time, we lose track of our spending and have no clear idea where our money is going.

We need a simple app that automatically captures our UPI payments, saves them as expenses, and lets us calculate and pay in one place—so tracking money feels effortless and happens in the background.

### Pain Points:

- Forget to record small daily expenses.
- Hard to understand monthly spending patterns.
- Want an easy way to calculate and pay in one flow.

---

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

# Log command for Android

```bash
adb logcat *:E
```

Here is the breakdown of how `adb logcat *:E` works:

- `adb`: This stands for Android Debug Bridge, a command-line tool that allows you to communicate with an Android device (either an emulator or a physical device). It is used for tasks such as installing apps, debugging, and accessing device logs.
- `logcat`: This is a command that retrieves the log messages from the Android device. It displays the logs in real-time, allowing developers to see what's happening on the device as they interact with it.
- `*:E`: This sets the filter priority level to Error. and the asterisk (\*) means that it applies to all tags.

**The log levels**

Some of most commonly used log levels :

| Tag | Priority Level | Description                                              |
| --- | -------------- | -------------------------------------------------------- |
| \*  | All            | All log messages (lowest priority)                       |
| V   | Verbose        | Everything (lowest priority)                             |
| D   | Debug          | Debugging messages                                       |
| I   | Info           | General information                                      |
| W   | Warn           | Potential issues                                         |
| E   | Error          | Critical issues/Crashing (What your command filters for) |
| F   | Fatal          | Severe crashes where the process dies                    |
| S   | Silent         | Highest priority (suppresses all logs)                   |
