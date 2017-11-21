### For opening the raspberry pi in kiosk mode write the following in `/home/pi/.config/lxsession/LXDE-pi/autostart`:

```
@lxpanel --profile LXDE
@pcmanfm --desktop --profile LXDE
@xset s off
@xset -dpms
@xset s noblank
@sed -i 's/"exited_cleanly": false/"exited_cleanly": true/' ~/.config/chromium Default/Preferences
@chromium --noerrdialogs --kiosk http://127.0.0.1 --incognito --disable-translate
```

### /!\ Run everything below as root.

### To install nodejs, run as root:
```
curl -sL https://deb.nodesource.com/setup_9.x | bash -
apt-get install -y nodejs
```

### Clone this repo:

```
apt-get install git
git clone https://github.com/shark0der/yesno.git /root/server
```

### Install pm2, install dependencies, start script, configure pm2 to run at startup:
```
npm i -g pm2
cd /root/server
npm install
pm2 start index.js
pm2 save
pm2 startup
```

### Reboot to test that everything works: `reboot`.
