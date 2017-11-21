For opening the raspberry pi in kiosk mode write the following in `/home/pi/.config/lxsession/LXDE-pi/autostart`:

```
@lxpanel --profile LXDE
@pcmanfm --desktop --profile LXDE
@xset s off
@xset -dpms
@xset s noblank
@sed -i 's/"exited_cleanly": false/"exited_cleanly": true/' ~/.config/chromium Default/Preferences
@chromium --noerrdialogs --kiosk http://127.0.0.1 --incognito --disable-translate
```

