export const setFlag = () => {
  sessionStorage.setItem('fromWorkList', 'true');
};

export const getFlag = () => sessionStorage.getItem('fromWorkList') === 'true';

export const clearFlag = () => {
  sessionStorage.removeItem('fromWorkList');
};
