import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/action/apiUserAction";
import { userGetAllOrders } from "../../lib/axiosAPI";
import Paginate from "../../components/Paginate/index.jsx";
import Meta from "../../components/Meta";
import { useSearchParams } from "react-router-dom";
import DisplayPending from "../../components/DisplayPending";

export default function OrderPage() {
  const navigate = useNavigate();
  let dispatch = useDispatch();
  let [orders, setOrders] = React.useState({});
  let [pending, setPending] = React.useState(true);
  let { userInfo } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const currPageQuery = searchParams.get("currPage");

  React.useEffect(() => {
    if (userInfo) {
      userGetAllOrders(userInfo, currPageQuery)
        .then(function (res) {
          setOrders(res.data);
          setPending(false);
        })
        .catch(function (error) {
          if (error.response.status === 401) {
            dispatch(logout());
          } else {
            console.log(error.message);
            setPending(false);
          }
        });
    }
  }, [dispatch, userInfo, userInfo.token, currPageQuery]);

  return (
    <div className="orders_body">
      <Meta title="Orders" />
      <DisplayPending pending={pending} />
      <div className="orders_container">
        <div className="orders_title">Order History</div>
        {orders.orders?.map((order) => {
          return (
            <div className="orders_listing" key={order._id}>
              <div className="orders_listing_header">
                <div className="orders_listing_id">Order: {order._id}</div>
                <div className="orders_listing_header_rest">
                  Date: {new Date(order.createdAt).toISOString().slice(0, 10)}
                </div>

                <div className="orders_listing_header_totalPrice">
                  Total: $ {order.totalPrice / 100}
                </div>

                <div
                  className="orders_listing_header_order_detail"
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  <div>Order Details</div>
                </div>
              </div>
              <div className="orders_listing_body">
                <img src={order.orderItems[0].image} alt="listing_image" />
                <div className="order_listing_body_description">
                  <div style={{ fontWeight: 700 }}>Products:</div>
                  {order.orderItems.map((individualItem, index) => {
                    return (
                      <div key={index}>
                        {index < 3
                          ? `${index + 1}. ${individualItem.name}`
                          : index === 3
                          ? "More..."
                          : null}
                      </div>
                    );
                  })}
                </div>
                <div className="order_listing_body_shipping_description">
                  <div style={{ fontWeight: 700 }}>Shipping Address</div>
                  <div>{order.shippingAddress.line1}</div>
                  <div>{order.shippingAddress.line2}</div>
                  <div>{order.shippingAddress.city}</div>
                  <div>{order.shippingAddress.postalCode}</div>
                  <div>{order.shippingAddress.country}</div>
                </div>
                <div className="order_listing_body_delivery">
                  <div style={{ fontWeight: 700 }}>Delivery Status:</div>

                  <div>{order.isDelivered ? "Delivered" : "On the Way"}</div>
                </div>
              </div>
            </div>
          );
        })}
        <Paginate page={orders.page} pages={orders.pages} />
      </div>
    </div>
  );
}
