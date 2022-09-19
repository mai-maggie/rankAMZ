
DATE=$(date +%Y-%m-%d)

cd documents/cs/rankAMZ
echo $DATE > script.log
echo "login to rankAMZ" >> script.log
node workbookload.js
echo "workbookload done!" >> script.log
node run.js B09MDHMPZD "2x4 led drop ceiling light fixture"
node run.js B09MDHMPZD "2x4 led light fixture"
node run.js B09MDHMPZD "2x4 led flat panel light 5000k"
node run.js B09MDHMPZD "led panel lights 2x4"
node run.js B09MDHMPZD "2x4 led troffer"
node run.js B09MDHMPZD "2x4 led flat panel light"
node run.js B09MDHMPZD "led flat panel light 2x4"
node run.js B09MDHMPZD "led 2x4 flat panel light"
node run.js B09MDHMPZD "2x4 led panel"
node run.js B09MDHMPZD "led drop ceiling lights 2x4"
node run.js B09MDHMPZD "troffer light 2x4"
node run.js B09MDHMPZD "led 2x4 drop ceiling lights"
node run.js B09MDHMPZD "2x4 light fixture"
node run.js B09MDHMPZD "2x4 led"
node run.js B09MDHMPZD "2'x4' led flat light panel"
node run.js B09MDGNFJV "2x2 led flat panel light"
node run.js B09MDGNFJV "2x2 led light drop ceiling"
node run.js B09MDGNFJV "2x2 led flat panel light 4000k"
node run.js B09MDGNFJV "2x2 led flat panel light 5000k"
node run.js B09MDGNFJV "led drop ceiling lights 2x2"
node run.js B09MDGNFJV "2x2 led panel"
node run.js B09MDGNFJV "2x2 led light"
node run.js B09MDGNFJV "2x2 lay in led light fixtures"
node run.js B09MDGNFJV "2x2 led"
node run.js B07HH46NHF "2x4 surface mount kit"
node run.js B07HH46NHF "surface mount kit 2x4"
node run.js B07HH46NHF "2x4 led surface mount kit"
node run.js B07HH46NHF "2x4 flat panel mount kit"
node run.js B08DRKT5N5 "2x2 surface mount kit"
node run.js B08DRKT5N5 "2x2 led panels surface mount kit"
node run.js B08DRKT5N5 "led 2x2 surface mount frames"
node run.js B08CHB5B7L "1x4 surface mount kit"
node run.js B08CHB5B7L "1x4 led flat panel mount kit"
node run.js B08CHB5B7L "10 pack 1x4 ft led surface mount kit"
echo "rank done" >> script.log

