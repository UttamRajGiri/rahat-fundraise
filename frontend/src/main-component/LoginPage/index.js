import { toast } from 'react-toastify';
import React, { useContext, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import SimpleReactValidator from 'simple-react-validator';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import './style.scss';
import UserContext from '../../context/user-context';

const LoginPage = (props) => {
  const [value, setValue] = useState({
    email: '',
    remember: false,
    isLoading: false,
  });

  const changeHandler = (e) => {
    setValue({ ...value, [e.target.name]: e.target.value });
    validator.showMessages();
  };

  const rememberHandler = () => {
    setValue({ ...value, remember: !value.remember });
  };

  const [validator] = React.useState(
    new SimpleReactValidator({
      className: 'errorMessage',
    }),
  );

  const submitForm = async (e) => {
    e.preventDefault();
    setValue((previous) => {
      return {
        ...previous,
        isLoading: true,
      };
    });
    if (validator.allValid()) {
      try {
        const resData = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/user/login`,
          {
            method: 'POST',
            body: JSON.stringify({
              email: value.email,
            }),

            headers: {
              'Content-Type': 'application/json',
            },
          },
        ).then((res) => res.json());

        if (resData?.data?.email) {
          const email = resData.data.email;

          const otpResult = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/user/otp`,
            {
              method: 'POST',
              body: JSON.stringify({
                email: email,
              }),
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
          const otpRes = await otpResult.json();

          if (otpRes.ok) {
            setValue({
              email: '',
              password: '',
              remember: false,
            });
            validator.hideMessages();
            props.history.push('/otp', { email: value.email });

            toast.success('OTP has been sent to your email');
          } else {
            throw new Error('Failed to send OTP.');
          }
        } else {
          throw new Error(resData?.msg);
        }
      } catch (error) {
        toast.error(error.message);
        setValue((previous) => {
          return {
            ...previous,
            isLoading: false,
          };
        });
      }
    } else {
      validator.showMessages();
      toast.error('Empty field is not allowed!');
      setValue((previous) => {
        return {
          ...previous,
          isLoading: false,
        };
      });
    }
  };
  return (
    <Grid className="loginWrapper">
      <Grid className="loginForm">
        <h2>Sign In</h2>
        <p>Sign in to your account</p>
        <form onSubmit={submitForm}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                className="inputOutline"
                fullWidth
                placeholder="E-mail"
                value={value.email}
                variant="outlined"
                name="email"
                label="E-mail"
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={(e) => changeHandler(e)}
                onChange={(e) => changeHandler(e)}
              />
              {validator.message('email', value.email, 'required|email')}
            </Grid>

            <Grid item xs={12}>
              <Grid className="formAction">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value.remember}
                      onChange={rememberHandler}
                    />
                  }
                  label="Remember Me"
                />
              </Grid>
              <Grid className="formFooter">
                <Button
                  fullWidth
                  className="cBtnTheme"
                  type="submit"
                  disabled={value?.isLoading}
                >
                  Login
                </Button>
              </Grid>
              {/* <Grid className="loginWithSocial">
                <Button className="google">
                  <i className="fa fa-google mr-4"></i> Sign up using google
                </Button>
              </Grid> */}
              <p className="noteHelp">
                Don't have an account?{' '}
                <Link to="/signup">Create free account</Link>
              </p>
            </Grid>
          </Grid>
        </form>
        <div className="shape-img">
          <i className="fi flaticon-honeycomb"></i>
        </div>
      </Grid>
    </Grid>
  );
};

export default withRouter(LoginPage);
