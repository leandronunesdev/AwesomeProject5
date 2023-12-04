import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import emv from 'node-emv';

export const readMasterCardCreditCard = async () => {
  try {
    NfcManager.cancelTechnologyRequest();
  } catch (error) {}

  try {
    const commands = [
      '00A4040007A00000000410100E',
      '80A8000002830000',
      '00B2011400',
      '00B2010C00',
      '00B2012400',
      '00B2022400',
    ];

    await NfcManager.requestTechnology([NfcTech.IsoDep]);

    const responses = [];

    for (let i = 0; i < commands.length; i++) {
      const resp = await NfcManager.isoDepHandler.transceive(
        toByteArray(commands[i]),
      );
      responses.push(resp);
    }

    if (responses && responses.length > 3) {
      const r = await getEmvInfo(toHexString(responses[2]));
      console.log('r', JSON.stringify(r));
      if (r) {
        const cardInfo = getCardInfoMasterCard(r);
        if (cardInfo) {
          return {
            card: cardInfo.card,
            exp: cardInfo.exp,
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

const getEmvInfo = info => {
  return new Promise(resolve => {
    emv.describe(info, data => {
      if (data) {
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
};

const toByteArray = text => {
  return text.match(/.{1,2}/g).map(b => {
    return parseInt(b, 16);
  });
};

const toHexString = byteArr => {
  return byteArr.reduce((acc, byte) => {
    return acc + ('00' + byte.toString(16).toUpperCase()).slice(-2);
  }, '');
};

const getCardInfoMasterCard = responses => {
  let res;
  let end = false;
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    if (r.tag === '70' && r.value && r.value.length > 0) {
      for (let j = 0; j < r.value.length; j++) {
        const e = r.value[j];
        if (e.tag === '5A' && e.value) {
          if (!res) {
            res = {
              card: e.value,
            };
          } else {
            res.card = e.value;
          }

          if (res.card && res.exp) {
            end = true;
          }
        }

        if (e.tag === '5F24' && e.value) {
          if (!res) {
            res = {
              exp: e.value,
            };
          } else {
            res.exp = e.value;
          }

          if (res.card && res.exp) {
            end = true;
          }
        }

        if (end) {
          break;
        }
      }

      if (end) {
        break;
      }
    }
  }
  return res;
};
