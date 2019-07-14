/* eslint-disable */
import axios from 'axios';

let language = 'en';
//defineLanguage();
      
let dicts = {};
      
// Русский язык
dicts.ru = {
          
    // Меню
    menu_play                           : 'Играть',
    menu_rules                          : 'Правила',
    menu_history                        : 'История',
    menu_statistics                     : 'Статистика',
          
    // Играть
    play_title1                         : 'Лотерея, основанная на',
    play_title2                         : 'смарт-контракте Ethereum',
    play_title3                         : 'с открытым',
    play_title4                         : 'исходным кодом',
    play_title5                         : 'Все операции выполняются автоматически смарт-контрактом и гарантируют прозрачность игры и 100%-ую выплату выигрыша.',
    play_game_num                       : 'Номер игры',
    play_prize_fund                     : 'Призовой фонд',
    play_jackpot                        : 'Джекпот',
    play_left                           : 'Осталось',
    play_select                         : 'Выберите',
    play_numbers                        : 'номер(ов)',
    play_ready                          : 'Готово',
    play_no_numbers                     : 'Нет выбранных чисел',
    play_txt1                           : 'Для участия в игре отправьте 0.01 ETH на адрес',
    play_txt2                           : ', в поле DATA вставьте скопированую строку',
    play_txt3                           : 'Для быстрой игры',
    play_txt3link                       : 'установите Metamask',
    play_play                           : 'Играть с Metamask',
          
    // Правила
    rules_play_time1                    : 'Время розыгрыша лотереи',
    rules_play_time2                    : 'каждый четверг с 10-00 до 13-00 GMT',
    rules_play_time3                    : 'Не покупайте билеты во время розыгрыша!',
    rules_ticket_cost                   : 'Стоимость одного билета',
    rules_ticket_cost1                  : 'Вы можете купить неограниченное число билетов.',
    rules_ticket_cost2                  : 'Для проверки билетов и получения выигрыша необходимо отправить на адрес смарт-контракта',
    rules_ticket_cost3                  : 'Рекомендуемый Gas Limit:',
    rules_ticket_cost4                  : 'Gas Limit зависит от количества непроверенных билетов.',
    rules_address                       : 'Адрес смарт-контракта',
    rules_wallets                       : 'Рекомендуемые кошельки',
    rules_wallets1                      : 'и другие кошельки от которых у вас есть приватные ключи.',
    rules_wallets2                      : 'Не допускается оплата с бирж!',
    rules_wallets3                      : 'Если вы некорректно заполните поле DATA при оплате билета, смарт-контракт выберет вам номера случайным образом!',
    rules_gas_limit                     : 'Рекомендуемый Gas Limit',
    rules_gas_price                     : 'Рекомендуемый Gas Price',
    rules_distr_funds                   : 'Распределение средств',
    rules_prize_fund                    : 'Призовой фонд',
    rules_service                       : 'Обслуживание и реклама',
    rules_prize_pool_distr              : 'Распределение призового фонда',
    rules_prize_txt1                    : 'Неразыгранные фонды переходят в Джекпот.',
    rules_prize_txt2                    : 'Разыгранные фонды распределяются между выигрышными билетами.',
    rules_jackpot_inc                   : 'Увеличение Джекпота',
    rules_match                         : 'Совпадение',
  
    // История
    history_title                       : 'История игр',
    history_col1                        : 'Номер игры',
    history_col2                        : 'Выигрышные номера',
    history_col3                        : 'Призовой фонд',
          
    // Статистика
    statisctics_title                   : 'Статистика игрока',
    statisctics_col1                    : 'Номер игры',
    statisctics_col2                    : 'Номер билета',
    statisctics_col3                    : 'Выбранные номера',
    statisctics_col4                    : 'Выигрыш',
    statistics_update                   : 'Обновить',
    statisctics_no_draw                 : 'Нет розыгрыша',
  
};
      
      // Английский язык
dicts.en = {
          
    // Меню
    menu_play                           : 'Play',
    menu_rules                          : 'Rules',
    menu_history                        : 'History',
    menu_statistics                     : 'Statistics',
          
    // Играть
    play_title1                         : 'Lottery, based on ',
    play_title2                         : 'Ethereum smart contract',
    play_title3                         : 'with an open',
    play_title4                         : 'source code',
    play_title5                         : 'All operations are performed automatically by a smart contract and guarantee the transparency of the game and 100% payout of the winnings.',
    play_game_num                       : 'Game number',
    play_prize_fund                     : 'Prize fund',
    play_jackpot                        : 'Jackpot',
    play_left                           : 'Left',
    play_select                         : 'Select',
    play_numbers                        : 'number(s)',
    play_ready                          : 'Ready',
    play_no_numbers                     : 'No numbers selected',
    play_txt1                           : 'To participate in the game, send 0.01 ETH to',
    play_txt2                           : ' address, in the DATA field, paste the copied string',
    play_txt3                           : 'For a quick game',
    play_txt3link                       : 'install Metamask',
    play_play                           : 'Play with Metamask',
          
    // Правила
    rules_play_time1                    : 'Lottery time',
    rules_play_time2                    : 'every Thursday from 10-00 to 13-00 GMT',
    rules_play_time3                    : 'Do not buy tickets during the draw!',
    rules_ticket_cost                   : 'The cost of one ticket',
    rules_ticket_cost1                  : 'You can buy an unlimited number of tickets.',
    rules_ticket_cost2                  : 'To check the tickets and get the prize you need to send to the address of the smart contract',
    rules_ticket_cost3                  : 'Recommended Gas Limit:',
    rules_ticket_cost4                  : 'Gas Limit depends on the number of winning tickets.',
    rules_address                       : 'Smart contract address',
    rules_wallets                       : 'Recomended Wallets',
    rules_wallets1                      : 'and other wallets from which you have private keys.',
    rules_wallets2                      : 'Payment from exchanges is not allowed!',
    rules_wallets3                      : 'If you incorrectly fill in the DATA field when paying for a ticket, the smart contract will randomly select your numbers!',
    rules_gas_limit                     : 'Recomended Gas Limit',
    rules_gas_price                     : 'Recomended Gas Price',
    rules_distr_funds                   : 'Distribution of funds',
    rules_prize_fund                    : 'Prize fund',
    rules_service                       : 'Service and advertising',
    rules_prize_pool_distr              : 'Prize pool distribution',
    rules_prize_txt1                    : 'Unplayed funds go to Jackpot.',
    rules_prize_txt2                    : 'The drawn funds are distributed between winning tickets.',
    rules_jackpot_inc                   : 'Jackpot increase',
    rules_match                         : 'Match',
          
    // История
    history_title                       : 'Game history',
    history_col1                        : 'Game number',
    history_col2                        : 'Winning numbers',
    history_col3                        : 'Prize fund',
          
    // Статистика
    statisctics_title                   : 'Player statistics',
    statisctics_col1                    : 'Game number',
    statisctics_col2                    : 'Ticket number',
    statisctics_col3                    : 'Selected numbers',
    statisctics_col4                    : 'Prize',
    statistics_update                   : 'Refresh',
    statisctics_no_draw                 : 'No draw',
  
};

export default {
    defineLanguage      :defineLanguage,
    setLanguage         :setLanguage,
    getLanguage         :getLanguage,
    getDictonary        :getDictonary,
    getLangList         :getLangList,
}

function defineLanguage(next) {

    axios
        .get('http://ip-api.com/json/?fields=country,region,city')
        .then(response => {
            
            let data = response.data;
            if(data.country == 'Belarus' || data.country == 'Russia' || data.country == 'Ukraine') {
                setLanguage('ru');
            } else {
                setLanguage('en');
            }
            if(typeof(next) == 'function') next();
        })
        .catch(error => { 
            setLanguage('en');
            if(typeof(next) == 'function') next();
            console.log(error);
        });
    
}

function setLanguage(lang) {
  
    switch(lang) {
        case 'ru':
            language = 'ru';
            break;
        case 'en':
            language = 'en';
            break;
        default:
            language = 'en';
            break;
    }
    
}
      
function getLanguage() { return language; }
      
function getDictonary() { return dicts[language]; }
      
function getLangList() {
    var out_arr = [];
    for(var key in dicts) out_arr.push(key);
    return out_arr
}