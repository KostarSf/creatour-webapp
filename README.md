# Веб-приложение Креатур

Цифровая платформа Креатур, предоставляющая площадку для размещения тур продуктов.

## Запуск приложения

Загрузите и установите Node.js 18.13.0 -
[ссылка на загрузку](https://nodejs.org/dist/v18.13.0/node-v18.13.0-x64.msi)

Склонируйте репозиторий, либо загрузите архив с исходным кодом проекта в отдельную папку, затем откройте папку проекта в проводнике.

Откройте PowerShell или командную строку в этой папке. Удерживая Shift, щелкните правкой кнопкой мыши по свободному месту в окне проводника, выберите пункт "Открыть окно PowerShell здесь".

Установите зависимости следующей командой в терминале:

```sh
npm install
```

Запустите проект командой:

```sh
npm run dev
```

Пока окно терминала не будет закрыто, сайт проекта будет доступен локально у вас на компьютере по адресу http://localhost:3000

Чтобы завершить приложение, нажмите Ctrl + C в терминале

## Просмотр и редактирование базы данных

Находясь в терминале, в папке проекта, наберите следующую команду

```sh
npx prisma studio
```

Пока работает эта команда, посмотреть и изменить базу данных можно будет в браузере, по адресу http://localhost:5555

Команду можно запустить в новом отдельном окне терминала, чтобы не выключать веб-приложение.
