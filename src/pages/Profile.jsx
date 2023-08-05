import { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'





function Profile() {
    const auth = getAuth()

    const [changeDetails, setChangeDetails] = useState(false)

    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })

    const { name, email } = formData

    const navigate = useNavigate();

    const onLogout = () => {
        auth.signOut()
        navigate('/')
    }

    const onSubmit = async () => {
        try {
            if (auth.currentUser.displayName !== name) {
                //Update the display name
                await updateProfile(auth.currentUser, { displayName: name })

                // update in firestore
                const userRef = doc(db, 'users', auth.currentUser.uid)
                await updateDoc(userRef, {
                    name
                })
            }

        } catch (error) {
            toast.error('Could not update profile details')
        }

    }

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,

        }))
        console.log(e.target.id)

    }



    return (
        <>
            <div className='profile'>
                <header className='profileHeader'>
                    <p className='pageHeader'>My Profile</p>
                    <button type='button' className='logOut' onClick={onLogout}>
                        Logout
                    </button>
                </header>

                <main>
                    <div className='profileDetailsHeader'>
                        <p className='profileDetailsText'>Personal Details</p>
                        <p className="changePersonalDetails" onClick={() => {
                            changeDetails && onSubmit()
                            setChangeDetails((prevState) => !prevState)
                        }} > {changeDetails ? ' Done' : 'change'} </p>
                    </div>
                    <div className="profileCard">
                        <form >
                            <input type="text" id='name' className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name} onChange={onChange} />

                            <input type="email" id='email' className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails} value={email} onChange={onChange} />


                        </form>
                    </div>
                    <Link to='/create-listing' className='createListing' >
                        <img src={homeIcon} alt="home" />
                        <p>Sell or rent your home</p>
                        <img src={arrowRight} alt="arrow right" />
                    </Link>
                </main>
            </div>
            {/* {user ? <h1> {user.displayName}</h1> : 'Not Logged In'} */}

        </>
    )
}
export default Profile