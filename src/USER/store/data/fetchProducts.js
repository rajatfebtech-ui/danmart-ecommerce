import GlobalAxios from "../../../../Global/GlobalAxios";

export const fetchProducts = async () => {
  try {
    const response = await GlobalAxios.get('/products');
    console.log(response.data.data);
    if (response.data.status === 'success') {
      return (response.data.data);
    }
  } catch (error) {
    console.error(error);
  }
};