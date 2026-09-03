# v1.5.0
## Версия 2.5.0 (4 опубликованный релиз)
### Также модуль доступен на:
* ###  на npm 
* ### ссылка на скачивание [www.npmjs.com](https://www.npmjs.com/package/@prm-programmer/safe-chalk)
## В модуле появились дополнительные цвета и эффекты (+140 цветов и разные типы шрифта)
### Скачивание:
```java
npm i @prm-programmer/safe-chalk
```
### Использование:
#### CommonJS
```javascript
// Импортируем модуль через commonjs
const safeChalk = require("chalk");
```
#### ES Modules
```javascript
// Импортируем модуль через ES Modules
import safeChalk from "@prm-programmer/safe-chalk";
```
### Выполнение
```javascript
// ОКРАШИВАНИЕ ТЕКСТА
// Синий текст
console.log(safeChalk.Blue("Blue"));
// Зелёный текст
console.log(safeChalk.Green("Green"));
// Красный текст
console.log(safeChalk.Red("Red"));

// ОКРАШИВАНИЕ ТЕКСТА И ФОНА
// Окрашивание фона в синий и текста в белый
console.log(safeChalk.bgBlue().White("Blue background and white text"));
// Окрашивание фона в зелёный и текста в серый
console.log(safeChalk.bgGreen().Black("Green background and black text"));
// Окрашивание фона в красный и текста в белый
console.log(safeChalk.bgRed().White("Red background and white text"));

// СПЕЦИАЛЬНЫЕ СТИЛИ
// Подчёркивание текста
console.log(safeChalk.underline("Underline"));
// Жирный текст
console.log(safeChalk.bold('Bold'));
// Блеклый текст
console.log(safeChalk.dim('Dim'));
// Курсив
console.log(safeChalk.italic('Italic'));
// Зачёркнутый текст
console.log(safeChalk.strikethrough('Strikethrough'));
// Инверсия цветов
console.log(safeChalk.inverse('Inverse'));

```
#### Результат:
<img width="328" height="276" src="https://github.com/user-attachments/assets/d596d696-ed87-449b-a1a5-71284801f965"/>

### ramanapavel@gmail.com или p7841744@gmail.com

@RPM-programmer