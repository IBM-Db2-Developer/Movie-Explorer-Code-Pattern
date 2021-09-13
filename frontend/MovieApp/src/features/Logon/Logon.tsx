import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Form,
  TextInput,
  Button,
  InlineNotification,
  InlineLoading,
  ComposedModal,
  ModalBody,
  Checkbox,
} from 'carbon-components-react';
import { useForm, Controller } from 'react-hook-form';
import { getSessionSelector } from '../../redux/reducers/auth';
import { useLoginMutation, SessionRequest } from '../../redux/services/session';
import styles from './logon.module.scss';

type FetchError = Error & {
  error: string;
};

export const Logon = () => {
  const [loading, setLoading] = useState(false);
  const session = useSelector(getSessionSelector);
  const [logonError, setLogonError] = useState('');
  const [login] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { isDirty, errors, dirtyFields },
  } = useForm<SessionRequest>({
    defaultValues: {
      database: 'movies',
      dbPort: 50000,
      restPort: 50050,
      ssl: false,
      password: '',
      username: 'db2inst1',
      expiryTime: '24h',
      hostname: '192.168.2.22',
    },
  });

  async function handleLogin(data: SessionRequest) {
    setLoading(true);
    try {
      const result = await login(data).unwrap();
      if (result.includes('Error')) {
        setLogonError(result);
        return;
      }
    } catch (e) {
      const err = e as FetchError;
      setLogonError(err.message || err.error);
    } finally {
      setLoading(false);
    }
  }

  const requiredField = 'Field is required.';

  return (
    <ComposedModal size="lg" preventCloseOnClickOutside open={!session} onClose={() => false}>
      <ModalBody hasForm hasScrollingContent aria-label="Logon Form">
        <h3 className="welcome">Log In</h3>
        <div className={styles.logonContainerGap}>
          {logonError && (
            <InlineNotification
              onCloseButtonClick={() => setLogonError('')}
              kind="error"
              title="Error"
              subtitle={logonError}
              aria-label={logonError}
            />
          )}
        </div>
        <Form onSubmit={handleSubmit(handleLogin)}>
          <div className={styles.formFields}>
            <Controller
              rules={{
                required: requiredField,
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="hostname"
                  aria-label="hostname"
                  autoComplete="hostname"
                  id="hostname"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.hostname}
                  invalidText={errors.hostname?.message}
                />
              )}
              name="hostname"
              control={control}
            />
            <Controller
              rules={{
                required: requiredField,
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="restPort"
                  aria-label="restPort"
                  id="restPort"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.restPort}
                  invalidText={errors.restPort?.message}
                />
              )}
              name="restPort"
              control={control}
            />
            <Controller
              rules={{
                required: requiredField,
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="database"
                  aria-label="database"
                  id="database"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.database}
                  invalidText={errors.database?.message}
                />
              )}
              name="database"
              control={control}
            />

            <Controller
              rules={{
                required: requiredField,
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="dbPort"
                  aria-label="dbPort"
                  id="dbPort"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.dbPort}
                  invalidText={errors.dbPort?.message}
                />
              )}
              name="dbPort"
              control={control}
            />
            <span />
            <Controller
              name="ssl"
              control={control}
              render={({ field: { value, onChange } }) => {
                return <Checkbox checked={value} onChange={onChange} id="ssl" labelText="Use SSL" />;
              }}
            />

            <Controller
              rules={{
                required: requiredField,
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="Username"
                  aria-label="Username"
                  id="username"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.username}
                  invalidText={errors.username?.message}
                />
              )}
              name="username"
              control={control}
            />
            <Controller
              rules={{ required: requiredField }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  labelText="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                  id="password"
                  type="password"
                  onChange={onChange}
                  defaultValue={value}
                  invalid={!!errors.password}
                  invalidText={errors.password?.message}
                />
              )}
              name="password"
              control={control}
            />
          </div>
          <div className={styles.logonContainerButtonContainer}>
            <span />
            {loading ? (
              <InlineLoading
                description="Loading"
                status="active"
                aria-live="polite"
                className={styles.loadingContainer}
              />
            ) : (
              <Button
                className={styles.logonContainerButton}
                tooltipAlignment="end"
                type="submit"
                disabled={!isDirty || !dirtyFields.password}
                aria-label="Logon"
              >
                Logon
              </Button>
            )}
          </div>
        </Form>
      </ModalBody>
    </ComposedModal>
  );
};
