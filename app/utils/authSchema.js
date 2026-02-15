import * as Yup from 'yup';
const validationSchema = Yup.object().shape({
    email:Yup.string()
    .required('Email is required !!')
    .email('Email is invalid'),
    password:Yup.string()
    .required('Password is required !!')
    .min(6, 'Password must be at least 6 characters'),
    userName:Yup.string()
    .required('User Name is required !!')
    .min(5, 'User Name must be at least 5 characters'),

});
export default validationSchema