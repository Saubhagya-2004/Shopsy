import { collection, doc, setDoc } from 'firebase/firestore';
import {slots} from '../store/resturants'
import {db} from './firebaseconfig'
const resturantdata = slots
const uploadData = async()=>{
    try {
        for(let i=0;i<resturantdata.length;i++){
            const restaurants = resturantdata[i];
            const docRef = doc(collection(db," slot"),` slot${i+1}`)
            await setDoc(docRef,restaurants)
            console.log('Data uploaded')
        }
    } catch (error) {
        console.log('Error uploading data',error)
    }
}
export default uploadData 