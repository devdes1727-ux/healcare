const { mssql, poolPromise } = require("../config/db");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

exports.createSubscriptionSession = async (req, res) => {
    try {
        const pool = await poolPromise;
        const doctorData = await pool.request()
            .input('uid', mssql.Int, req.user.id)
            .query("SELECT id, stripe_customer_id FROM Doctors WHERE user_id = @uid");
        
        if (!doctorData.recordset.length) return res.status(404).json({ message: "Doctor not found" });
        const doctor = doctorData.recordset[0];

        let customerId = doctor.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({ email: req.user.email, name: req.user.name });
            customerId = customer.id;
            await pool.request()
                .input('cid', mssql.NVarChar, customerId)
                .input('uid', mssql.Int, req.user.id)
                .query("UPDATE Doctors SET stripe_customer_id = @cid WHERE user_id = @uid");
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'HealCare Doctor Monthly Subscription', description: 'Access to all features and online bookings' },
                    unit_amount: 49900,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `http://localhost:4200/doctor-dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:4200/doctor-dashboard`,
            metadata: { doctor_id: doctor.id, type: 'subscription' }
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Stripe error", error: err.message });
    }
};

exports.createPromotionSession = async (req, res) => {
    try {
        const pool = await poolPromise;
        const doctorData = await pool.request()
            .input('uid', mssql.Int, req.user.id)
            .query("SELECT id FROM Doctors WHERE user_id = @uid");
        const docId = doctorData.recordset[0].id;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Featured Doctor Boost', description: 'Priority listing for 30 days' },
                    unit_amount: 99900,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `http://localhost:4200/doctor-dashboard?promo=success`,
            cancel_url: `http://localhost:4200/doctor-dashboard`,
            metadata: { doctor_id: docId, type: 'promotion' }
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).send("Promotion checkout error");
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock');
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const pool = await poolPromise;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const doctorId = session.metadata.doctor_id;
        const type = session.metadata.type;

        if (type === 'subscription') {
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);

            await pool.request()
                .input('did', mssql.Int, doctorId)
                .input('sid', mssql.NVarChar, session.subscription)
                .input('expiry', mssql.DateTime, expiry)
                .query(`
                    UPDATE Doctors SET subscription_status = 'active' WHERE id = @did;
                    INSERT INTO DoctorSubscriptions (doctor_id, stripe_subscription_id, plan_name, amount_paid, expiry_date)
                    VALUES (@did, @sid, 'monthly', 499, @expiry)
                `);
        } else if (type === 'promotion') {
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);

            await pool.request()
                .input('did', mssql.Int, doctorId)
                .input('expiry', mssql.DateTime, expiry)
                .query(`
                    UPDATE Doctors SET is_featured = 1 WHERE id = @did;
                    INSERT INTO DoctorPromotions (doctor_id, promotion_type, amount_paid, expiry_date)
                    VALUES (@did, 'featured', 999, @expiry)
                `);
        }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
        const subscription = event.data.object;
        await pool.request()
            .input('sid', mssql.NVarChar, subscription.id)
            .query("UPDATE Doctors SET subscription_status = 'expired' WHERE id IN (SELECT doctor_id FROM DoctorSubscriptions WHERE stripe_subscription_id = @sid)");
    }

    res.json({ received: true });
};
