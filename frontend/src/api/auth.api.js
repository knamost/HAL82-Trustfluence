import api from ".";

export const login = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    console.log(response);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response
  }
};


// register
export const register = async (data) => {
  try {
    // Only send fields the backend expects
    const { first_name, last_name, email, password, role } = data;
    const response = await api.post("/auth/register", {
      first_name,
      last_name,
      email,
      password,
      role,
    });
    console.log(response);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response;;
  }
};


// get user detail
export const getUserDetail = async() =>{
  try {
    const  response = await api.get('/auth/me')
    return response.data 
  } catch (error) {
    console.log(error)
    throw error.response   
  }
}