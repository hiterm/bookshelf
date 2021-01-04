import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import { firebase } from '../Firebase';
import { Field, FieldArray, Form, Formik } from 'formik';
import {
  CheckboxWithLabel,
  Select as FormikSelect,
  TextField as FormikTextField,
} from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as yup from 'yup';
import { db } from '../Firebase';
import { Book } from './schema';

type BulkChangeFormProps = {
  read: {
    enable: boolean;
    value: '' | 'true' | 'false';
  };
  owned: {
    enable: boolean;
    value: '' | 'true' | 'false';
  };
  authors: {
    enable: boolean;
    value: string[];
  };
};

const parseStrBoolean = (str: '' | 'true' | 'false') => {
  let value = true;
  switch (str) {
    case 'true':
      value = true;
      break;
    case 'false':
      value = false;
      break;
    default:
      throw new Error(`value cannot be parsed as boolean: ${str}`);
  }
  return value;
};

export const BulkChangeButton: React.FC<{ selectedBooks: Book[] }> = ({
  selectedBooks,
}) => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const { enqueueSnackbar } = useSnackbar();

  const innerBooleanSchema = yup.object().shape({
    enable: yup.boolean().required(),
    value: yup.string().when('enable', {
      is: true,
      then: yup.string().required(),
    }),
  });
  const bulkChangeFormSchema = yup.object().shape({
    read: innerBooleanSchema,
    owned: innerBooleanSchema,
    authors: yup.object().shape({
      enable: yup.boolean().required(),
      value: yup
        .array()
        .of(yup.string().required())
        .default([])
        .when('enable', {
          is: true,
          then: yup.array().of(yup.string().required()).required(),
        }),
    }),
  });
  // .test(
  //   // TODO 機能してない
  //   'at-least-one-enabled-required',
  //   'please select at least one',
  //   function (value) {
  //     // console.log(JSON.stringify(value));
  //     // console.log(value.read.enable || value.owned.enable);
  //     return value.read.enable || value.owned.enable || value.authors.enable;
  //   }
  // );

  const handleUpdate = async (values: BulkChangeFormProps) => {
    let bookProps: { read?: boolean; owned?: boolean; authors?: string[] } = {};
    if (values.read.enable) {
      bookProps.read = parseStrBoolean(values.read.value);
    }
    if (values.owned.enable) {
      bookProps.owned = parseStrBoolean(values.owned.value);
    }
    if (values.authors.enable) {
      bookProps.authors = values.authors.value;
    }

    // TODO 暫定的にここで判定 直ったら消す
    if (Object.keys(bookProps).length === 0) {
      enqueueSnackbar('最低一つは項目を選んでください', { variant: 'error' });
      return;
    }

    const bookPropsWithTimestamp = {
      ...bookProps,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const transactionPerBook = 2;
    const maxBook = 500 / transactionPerBook;
    for (
      let i = 0;
      i < Math.floor((selectedBooks.length + maxBook - 1) / maxBook);
      i++
    ) {
      const batch = db.batch();
      for (
        let j = i * maxBook;
        j < Math.min((i + 1) * maxBook, selectedBooks.length);
        j++
      ) {
        const book = selectedBooks[j];

        var bookRef = db.collection('books').doc(book.id);
        batch.update(bookRef, bookPropsWithTimestamp);
      }
      try {
        await batch.commit();
        enqueueSnackbar(
          `${i * maxBook + 1}件目から${Math.min(
            (i + 1) * maxBook,
            selectedBooks.length
          )}件目までの更新に成功しました`,
          { variant: 'success' }
        );
      } catch (error) {
        enqueueSnackbar(
          `${i * maxBook + 1}件目から${Math.min(
            (i + 1) * maxBook,
            selectedBooks.length
          )}件目までの更新に失敗しました: ${error}`,
          { variant: 'error' }
        );
      }
    }
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpenClick}
      >
        一括更新
      </Button>
      <Formik
        initialValues={{
          read: { enable: false, value: '' },
          owned: { enable: false, value: '' },
          authors: { enable: false, value: [] },
        }}
        validationSchema={bulkChangeFormSchema}
        onSubmit={handleUpdate}
      >
        {({ values, handleSubmit }) => (
          <Dialog open={open}>
            <DialogTitle>一括更新</DialogTitle>
            <DialogContent>
              <DialogContentText>
                選択した項目を一括更新します。
              </DialogContentText>
              <Form>
                <div>
                  <Field
                    component={CheckboxWithLabel}
                    color="primary"
                    name="read.enable"
                    type="checkbox"
                    Label={{ label: '既読' }}
                  />
                  <Field component={FormikSelect} name="read.value">
                    <MenuItem value={''}></MenuItem>
                    <MenuItem value={'true'}>既読</MenuItem>
                    <MenuItem value={'false'}>未読</MenuItem>
                  </Field>
                </div>
                <div>
                  <Field
                    component={CheckboxWithLabel}
                    color="primary"
                    name="owned.enable"
                    type="checkbox"
                    Label={{ label: '所有' }}
                  />
                  <Field component={FormikSelect} name="owned.value">
                    <MenuItem value={''}></MenuItem>
                    <MenuItem value={'true'}>所有</MenuItem>
                    <MenuItem value={'false'}>未所有</MenuItem>
                  </Field>
                </div>
                <div>
                  <Field
                    component={CheckboxWithLabel}
                    color="primary"
                    name="authors.enable"
                    type="checkbox"
                    Label={{ label: '著者' }}
                  />
                  <FieldArray
                    name="authors.value"
                    render={(arrayHelpers) => (
                      <div>
                        {values.authors.value.map(
                          (_author: string, index: number) => (
                            <div key={index}>
                              <Field
                                component={FormikTextField}
                                name={`authors.value.${index}`}
                              />
                              <Button
                                variant="contained"
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                -
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="contained"
                          type="button"
                          onClick={() => arrayHelpers.push('')}
                        >
                          著者追加
                        </Button>
                      </div>
                    )}
                  />
                </div>
              </Form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogCloseClick} color="primary">
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  handleSubmit();
                }}
                color="primary"
              >
                反映
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Formik>
    </div>
  );
};
