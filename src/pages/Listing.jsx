import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { db } from '../firebase.config'


function Listing() {

    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const params = useParams()
    const auth = getAuth()




    useEffect(() => {

        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)

            console.log(docRef);

            if (docSnap.exists()) {
                console.log(docSnap.data())
                console.log('Kadir')
                setListing(docSnap.data())

                setLoading(false)
            }
        }

        fetchListing()
        setLoading(false)

    }, [navigate, params.listingId])

    if (loading) {
        return <Spinner />
    }

    return (
        <>
            <main>
                <div className='shareIconDiv' onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setShareLinkCopied(true)
                    setTimeout(() => {
                        setShareLinkCopied(false)
                    }, 1500)
                }}>
                    <img />
                </div>
                {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

                <div className='listingDetails'>
                    <p className='listingName'>
                        {/* {listing.name} */}
                    </p>
                </div>



            </main>
        </>
    )
}

export default Listing