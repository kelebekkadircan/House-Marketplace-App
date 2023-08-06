import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { buildTimeValue } from '@testing-library/user-event/dist/utils'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-toastify'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


function CreateListing() {

    const navigate = useNavigate()

    const [geolocationEnabled, setGeolocationEnabled] = useState(true)

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,
    })

    const { type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice,
        images, latitude, longitude } = formData

    const auth = getAuth()

    const isMounted = useRef(true)

    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid })
                }
                else {
                    navigate('/sign-in')
                }
            })
        }

        return () => {
            isMounted.current = false;
        }

    }, [isMounted])

    if (loading) {
        return <Spinner />
    }
    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)

        if (discountedPrice > regularPrice) {
            setLoading(false)
            toast.error('Reduce the discounted price')

            return
        }

        if (images.length > 6) {
            setLoading(false)
            toast.error('Max 6 images')
            return
        }

        let geolocation = {}
        let location

        if (geolocationEnabled) {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDgEQs9pikyXq1Umtmd0yBza8GVO4qUqd0`)

            const data = await response.json()

            console.log(data);

        }
        else {
            geolocation.lat = latitude
            geolocation.lng = longitude
            location = address
        }

        // store images in firebase

        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

                const storageRef = ref(storage, 'images/' + fileName)

                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        reject(error)
                    },
                    () => {

                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );

            })
        }

        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))).catch(() => {
                setLoading(false)
                toast.error('Images not uploaded')
                return
            })


        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        delete formDataCopy.images
        delete formDataCopy.address
        location && (formDataCopy.location = location)
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        addDoc(collection(db, 'listings'), formDataCopy)

        setLoading(false)

        toast.success('Listing Saved')

        // navigate('/')



    }

    const onMutate = (e) => {
        let boolean = null;


        if (e.target.value === 'true') {
            boolean = true
        }
        if (e.target.value === 'false') {
            boolean = false
        }
        // Files
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }

        // TEXT
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }))
        }


    }

    return (
        <>
            <div className='profile'>
                <header>
                    <p className='pageHeader'>
                        Create a Listing
                    </p>
                </header>

                <main>
                    <form onSubmit={onSubmit}>
                        <label className='formLabel'>Sell / Rent</label>
                        <div className="formButtons">
                            <button className={type === 'sale' ? 'formButtonActive' : 'formButton'} id='type' type='button'
                                value='sale'
                                onClick={onMutate}
                            >
                                Sell
                            </button>
                            <button className={type === 'rent' ? 'formButtonActive' : 'formButton'} id='type' type='button'
                                value='rent'
                                onClick={onMutate}
                            >
                                Rent
                            </button>
                        </div>
                        <label className='formLabel'>Name</label>
                        <input
                            type="text"
                            className='formInputName'
                            id='name'
                            value={name}
                            onChange={onMutate}
                            maxLength='32'
                            minLength='10'
                            required
                        />

                        <div className='formRooms flex'>
                            <div>
                                <label className='formLabel'>Bedrooms</label>
                                <input
                                    type="number"
                                    className='formInputSmall'
                                    id='bedrooms'
                                    value={bedrooms}
                                    onChange={onMutate}
                                    max='50'
                                    min='1'
                                    required
                                />
                            </div>
                            <div>
                                <label className='formLabel'>Bathrooms</label>
                                <input
                                    type="number"
                                    className='formInputSmall'
                                    id='bathrooms'
                                    value={bathrooms}
                                    onChange={onMutate}
                                    max='50'
                                    min='1'
                                    required
                                />
                            </div>
                        </div>

                        <label className='formLabel'>Parking Spot</label>
                        <div className='formButtons'>
                            <button
                                className={parking ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='parking'
                                value={true}
                                onClick={onMutate}
                                min='1'
                                max='50'
                            >
                                Yes
                            </button>
                            <button
                                className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='parking'
                                value={false}
                                onClick={onMutate}
                                min='1'
                                max='50'
                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Furnished</label>
                        <div className='formButtons'>
                            <button
                                className={furnished ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='furnished'
                                value={true}
                                onClick={onMutate}

                            >
                                Yes
                            </button>
                            <button
                                className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='furnished'
                                value={false}
                                onClick={onMutate}

                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Address</label>
                        <textarea
                            className='formInputAddress'
                            type='text'
                            id='address'
                            value={address}
                            onChange={onMutate}
                            required
                        />

                        {!geolocationEnabled && (
                            <div className='formLatLng flex'>
                                <div>
                                    <label className='formLabel'>Latitude</label>
                                    <input
                                        className='formInputSmall'
                                        type="number"
                                        id='latitude'
                                        value={latitude}
                                        onChange={onMutate}
                                        required

                                    />
                                </div>

                                <div>
                                    <label className='formLabel'>Longitude</label>
                                    <input
                                        className='formInputSmall'
                                        type="number"
                                        id='longitude'
                                        value={longitude}
                                        onChange={onMutate}
                                        required

                                    />
                                </div>
                            </div>
                        )}

                        <label className='formLabel'>Offer</label>
                        <div className='formButtons'>
                            <button
                                className={offer ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='offer'
                                value={true}
                                onClick={onMutate}

                            >
                                Yes
                            </button>
                            <button
                                className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='offer'
                                value={false}
                                onClick={onMutate}

                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Regular Price</label>
                        <div className='formPriceDiv'>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='regularPrice'
                                value={regularPrice}
                                onChange={onMutate}

                                required
                            />
                            {type === 'rent' && (
                                <p className='formPriceText'>$ / Month</p>

                            )}
                        </div>

                        {offer && (
                            <>
                                <label className='formLabel'>Discounted Price</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='discountedPrice'
                                    value={discountedPrice}
                                    onChange={onMutate}
                                    min='50'
                                    max='750000000'
                                    required={offer}

                                />

                            </>
                        )}

                        <label className='formLabel'>Images</label>
                        <p className='imagesInfo'>The first image will be the cover (max 6).</p>
                        <input
                            className='formInputFile'
                            type='file'
                            id='images'
                            onChange={onMutate}
                            max='6'
                            accept='.jpg,.png,.jpeg'
                            multiple
                            required
                        />

                        <button className='primaryButton createListingButton' type='submit'>Create Listing</button>

                    </form>
                </main >
            </div >

        </>
    )
}

export default CreateListing