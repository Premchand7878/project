import { useNavigate, useParams } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux';
import { tokenExists } from '../Redux/UserSlice';
import { useEffect, useRef, useState } from 'react';
import { showService } from '../Redux/FreelancerSlice';
import { toast } from 'react-toastify';
import { makeOrder, makeTestimonial, orderInfo, serviceInfo, updateOrderStatus } from '../Redux/ClientSlice';
import FreelancerMenu from './FreelancerComponents/FreelancerMenu';
import Slider from './Slider';
import noImage from "../../src/assets/Images/no-image.png"
import ClientMenu from './ClientComponents/ClientMenu';
import Loading from './Loading';

export default function ServiceDetails({ type }) {
    const { id, serviceId } = useParams()
    const [loading, setLoading] = useState(true)
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    })
    const { token, avatar } = useSelector(state => state.user)
    const { data } = useSelector(type == 1 ? (state => state.freelancer) : (state => state.client))
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const testimonial = useRef()
    const [starNumber, setStarNumber] = useState(0)
    const [hoverStar, setHoverStar] = useState(undefined)

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validatePayment = () => {
        const errors = [];
        
        if (!paymentDetails.cardNumber.match(/^\d{16}$/)) {
            errors.push('Card number must be 16 digits');
        }
        
        if (!paymentDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
            errors.push('Expiry date must be in MM/YY format');
        }
        
        if (!paymentDetails.cvv.match(/^\d{3,4}$/)) {
            errors.push('CVV must be 3 or 4 digits');
        }
        
        if (paymentDetails.nameOnCard.trim().length < 3) {
            errors.push('Name on card is required');
        }
        
        return errors;
    }

    const handleSubmitPayment = (e) => {
        e.preventDefault();
        const errors = validatePayment();
        
        if (errors.length > 0) {
            toast.error(
                <div>
                    {errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
            );
            return;
        }
        
        // If payment validation passes, proceed with order creation
        handleOrder();
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        let err = []
        if (parseInt(starNumber) < 1 || parseInt(starNumber) > 5 || isNaN(parseInt(starNumber))) {
            err.push('You should choose a star at least')
        }
        if (testimonial.current.value.length > 120 || !/^.*[a-zA-Z]+.*$/.test(testimonial.current.value)) {
            err.push('The testimonial should contain 120 caracters or less')
        }
        if (err.length != 0) {
            toast.error(
                <div>
                    {err.map((e, i) => <p key={i}>{e}</p>)}
                </div>
            );
        } else {
            setLoading(true)
            dispatch(makeTestimonial({ orderId: serviceId, text: testimonial.current.value.trim(), rating: starNumber })).unwrap().then(data => {
                setTimeout(() => {
                    setLoading(false)
                    if (data.status == 200) {
                        toast.success(data.msg)
                        navigate(`/dashboard/client/${id}/orders`)
                    } else if (data.status === 403) {
                        toast.error(data.msg)
                        navigate('/login')
                    } else if (data.status === 404) {
                        navigate('/404')
                    } else {
                        toast.error(data.msg)
                        fetchData()
                    }
                }, 1000);
            }).catch((rejectedValueOrSerializedError) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.error(rejectedValueOrSerializedError)
                    fetchData()
                }, 1000);
            })
        }
    }

    const fetchData = () => {
        if (type == 1) {
            dispatch(showService(serviceId)).unwrap().then(data => {
                setTimeout(() => {
                    setLoading(false)
                    if (data.status == 404) {
                        navigate('/404')
                    }
                    if (data.status == 505) {
                        toast.error(data.msg)
                    }
                }, 1000);
            }).catch((rejectedValueOrSerializedError) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.error(rejectedValueOrSerializedError)
                }, 1000);
            })
        }
        if (type == 2) {
            dispatch(serviceInfo(serviceId)).unwrap().then(data => {
                setTimeout(() => {
                    setLoading(false)
                    if (data.status == 404) {
                        navigate('/404')
                    }
                    if (data.status == 505) {
                        toast.error(data.msg)
                    }
                }, 1000);
            }).catch((rejectedValueOrSerializedError) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.error(rejectedValueOrSerializedError)
                }, 1000);
            })
        }
        if (type == 3) {
            dispatch(orderInfo(serviceId)).unwrap().then(data => {
                setTimeout(() => {
                    setLoading(false)
                    if (data.status == 404) {
                        navigate('/404')
                    }
                    if (data.status == 505) {
                        toast.error(data.msg)
                    }
                }, 1000);
            }).catch((rejectedValueOrSerializedError) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.error(rejectedValueOrSerializedError)
                }, 1000);
            })
        }
    }

    useEffect(() => {
        tokenExists(token, navigate, dispatch).then(data => (data == false || JSON.parse(localStorage.getItem('userInfo'))._id != id || window.location.href.slice(32).split('/')[0] != JSON.parse(localStorage.getItem('userInfo')).role) && navigate("/login"))
        fetchData()
    }, [])

    const handleOrder = () => {
        setLoading(true)
        dispatch(makeOrder(serviceId)).unwrap().then(data => {
            setTimeout(() => {
                setLoading(false)
                if (data.status == 200) {
                    setShowPaymentForm(false)
                    toast.success(data.msg)
                    navigate(`/dashboard/client/${id}/orders`)
                }
                else if (data.status == 400) {
                    toast.info(data.msg)
                    fetchData()
                }
                else if (data.status == 403) {
                    toast.error(data.msg)
                    navigate('/login')
                }
                else if (data.status == 404) {
                    toast.error(data.msg)
                    navigate('/404')
                }
                else {
                    toast.error(data.msg)
                    fetchData()
                }
            }, 1000);
        }).catch((rejectedValueOrSerializedError) => {
            setTimeout(() => {
                setLoading(false)
                toast.error(rejectedValueOrSerializedError)
                fetchData()
            }, 1000);
        })
    }

    const handleUpdate = (e) => {
        setLoading(true)
        const status = e.target.name
        dispatch(updateOrderStatus({ orderId: serviceId, status })).unwrap().then(data => {
            setTimeout(() => {
                setLoading(false)
                if (data.status == 200) {
                    toast.success(data.msg)
                    navigate(`/dashboard/client/${id}/orders`)
                }
                else if (data.status == 400) {
                    toast.error(data.msg)
                    fetchData()
                }
                else if (data.status == 403) {
                    toast.error(data.msg)
                    navigate('/login')
                }
                else if (data.status == 404) {
                    toast.error(data.msg)
                    navigate('/404')
                }
                else {
                    toast.error(data.msg)
                    fetchData()
                }
            }, 1000);
        }).catch((rejectedValueOrSerializedError) => {
            setTimeout(() => {
                setLoading(false)
                toast.error(rejectedValueOrSerializedError)
                fetchData()
            }, 1000);
        })
    }

    return (
        <>
            {loading && <Loading />}
            {showPaymentForm && (
                <div className="payment-modal">
                    <div className="payment-modal-content">
                        <span className="close" onClick={() => setShowPaymentForm(false)}>&times;</span>
                        <h2>Payment Details</h2>
                        <form onSubmit={handleSubmitPayment}>
                            <div className="form-group">
                                <label>Card Number</label>
                                <input 
                                    type="text" 
                                    name="cardNumber" 
                                    value={paymentDetails.cardNumber}
                                    onChange={handlePaymentChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="16"
                                />
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input 
                                    type="text" 
                                    name="expiryDate" 
                                    value={paymentDetails.expiryDate}
                                    onChange={handlePaymentChange}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                />
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <input 
                                    type="text" 
                                    name="cvv" 
                                    value={paymentDetails.cvv}
                                    onChange={handlePaymentChange}
                                    placeholder="123"
                                    maxLength="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Name on Card</label>
                                <input 
                                    type="text" 
                                    name="nameOnCard" 
                                    value={paymentDetails.nameOnCard}
                                    onChange={handlePaymentChange}
                                    placeholder="Prem"
                                />
                            </div>
                            <div className="payment-total">
                                <p>Total Amount: {data?.selectedService?.price || data?.clientOrderInfo?.serviceInfo?.price} $</p>
                            </div>
                            <button type="submit" className="submit-payment">
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <div className='ServiceDetail'>
                <div className="container">
                    <div className="section">
                        {
                            type == 1 || type == 2 ?
                                <>
                                    {
                                        data?.selectedService &&
                                        <>
                                            <div className="mySwiperContainer">
                                                <Slider images={data.selectedService.images.split('|')} />
                                            </div>
                                            <div className="service-title">
                                                {data.selectedService.title}
                                            </div>
                                            <div className="service-description">
                                                {data.selectedService.description.split('\n').map((line, i) =>
                                                    <p key={i}>{line}</p>
                                                )}
                                            </div>
                                            {type == 1 ?
                                                <div className="service-price">
                                                    Price: {data.selectedService.price} $
                                                </div>
                                                :
                                                <div className="service-price-provider">
                                                    <div className="price">
                                                        Price {data.selectedService.price} $
                                                    </div>
                                                    <div className="provider">
                                                        <span>Service Provided By</span>
                                                        <img src={data.selectedService.userId.image === 'no-image.png' ? noImage : `http://localhost:3001/ProfilePic/${data.selectedService.userId.image}`} alt="Profile Picture" />
                                                    </div>
                                                </div>
                                            }
                                            {type == 1 ?
                                                <HashLink className="go-back-button" to={`/dashboard/freelancer/${id}/services`}><button>Go Back</button></HashLink>
                                                :
                                                type == 2 &&
                                                <>
                                                    <div className="bottom-buttons">
                                                        <HashLink className="go-back-button" to={`/dashboard/client/${id}/services`}><button>Go Back</button></HashLink>
                                                        <button onClick={() => setShowPaymentForm(true)}>Make Order</button>
                                                    </div>
                                                </>
                                            }
                                        </>
                                    }
                                </>
                                : data?.clientOrderInfo &&
                                <>
                                    <div className="mySwiperContainer">
                                        <Slider images={data.clientOrderInfo.serviceInfo.images.split('|')} />
                                    </div>
                                    <div className="service-title">
                                        {data.clientOrderInfo.serviceInfo.title}
                                    </div>
                                    <div className="service-description">
                                        {data.clientOrderInfo.serviceInfo.description.split('\n').map((line, i) =>
                                            <p key={i}>{line}</p>
                                        )}
                                    </div>
                                    <div className="service-price-provider">
                                        <div className="price">
                                            Price {data.clientOrderInfo.serviceInfo.price} $
                                        </div>
                                        <div className="provider">
                                            <span>Service Provided By</span>
                                            <img src={data.clientOrderInfo.serviceUserInfo.image === 'no-image.png' ? noImage : `http://localhost:3001/ProfilePic/${data.clientOrderInfo.serviceUserInfo.image}`} alt="Profile Picture" />
                                        </div>
                                    </div>
                                    {
                                        data.clientOrderInfo.status == 'OnGoing' ?
                                            <div className="bottom-buttons">
                                                <HashLink className="go-back-button" to={`/dashboard/client/${id}/orders`}><button>Go Back</button></HashLink>
                                                <button className='completed' name='Completed' onClick={e => handleUpdate(e)}>Completed</button>
                                                <button className='cancelled' name='Cancelled' onClick={e => handleUpdate(e)}>Cancelled</button>
                                            </div>
                                            :
                                            (data.clientOrderInfo.status == 'Completed' || data.clientOrderInfo.status == 'Cancelled') &&
                                            <>
                                                <div className="testimonialForm">
                                                    <form onSubmit={e => handleSubmit(e)}>
                                                        <img src={avatar === 'no-image.png' ? noImage : `http://localhost:3001/ProfilePic/${avatar}`} alt="Profile Picture" />
                                                        <div className="form-input">
                                                            <div className="testimonialHeader">
                                                                Add Testimonial
                                                            </div>
                                                            <div className="stars">
                                                                {Array(5).fill().map((_, index) =>
                                                                    starNumber >= index + 1 || hoverStar >= index + 1 ?
                                                                        <AiFillStar
                                                                            key={index}
                                                                            style={{ color: "var(--color-orange)", width: '30px', height: '30px', cursor: 'pointer' }}
                                                                            onMouseOver={() => !starNumber && setHoverStar(index + 1)}
                                                                            onMouseLeave={() => setHoverStar(undefined)}
                                                                            onClick={() => setStarNumber(index + 1)} />
                                                                        :
                                                                        <AiOutlineStar
                                                                            key={index}
                                                                            style={{ color: "var(--color-orange)", width: '30px', height: '30px', cursor: 'pointer' }}
                                                                            onMouseOver={() => !starNumber && setHoverStar(index + 1)}
                                                                            onMouseLeave={() => setHoverStar(undefined)}
                                                                            onClick={() => setStarNumber(index + 1)} />
                                                                )}
                                                            </div>
                                                            <textarea name="testtimonialText" ref={testimonial} placeholder='Write your opinion about the service' id="testtimonialText" maxLength={130}></textarea>
                                                            <button>Send</button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="bottom-buttons">
                                                    <HashLink className="go-back-button" to={`/dashboard/client/${id}/orders`}><button>Go Back</button></HashLink>
                                                    <div className={data.clientOrderInfo.status == "Completed" ? "statusCompleted" : "statusCancelled"}>{data.clientOrderInfo.status}</div>
                                                </div>
                                            </>
                                    }
                                </>
                        }
                    </div>
                    {type == 1 ?
                        <FreelancerMenu active="services" />
                        :
                        <ClientMenu active="freelancers" />
                    }
                </div>
            </div>

            <style jsx>{`
                .payment-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .payment-modal-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 400px;
                    max-width: 90%;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .close {
                    float: right;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .payment-total {
                    margin: 20px 0;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                }
                
                .submit-payment {
                    width: 100%;
                    padding: 10px;
                    background-color: var(--color-orange);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .submit-payment:hover {
                    background-color: #e67e22;
                }
            `}</style>
        </>
    )
}