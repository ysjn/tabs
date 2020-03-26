import "css.gg/icons/close.css";
import "css.gg/icons/search.css";
import { css, cx } from "emotion";
import { useObserver } from "mobx-react";
import React, { useCallback, useContext, useRef } from "react";

import { StoreContext } from "../StoreContext";

const styles = {
  wrapper: css`
    flex: 1 0 auto;
    padding: 10px;
  `,
  input: css`
    width: 100%;
    padding: 5px;
    background-color: transparent;
    color: var(--primary);
    border: none;

    :focus {
      outline: none;
    }
  `,
  inputWrapper: css`
    display: flex;
    align-items: center;
    background-color: var(--divider);
    border: 1px solid transparent;
    border-radius: 18px;
  `,
  icon: css`
    flex: 0 0 auto;
    margin: 3px;
    padding: 1px 6px;
    border-radius: 18px;
    color: var(--secondary);

    .gg-search {
      margin: 3px;
      top: -1px;
    }
  `,
  iconHover: css`
    &:hover {
      background-color: var(--hover);
      color: #f77;
      cursor: pointer;
    }
  `
};

const FilterInput: React.FC = () => {
  const store = useContext(StoreContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeHandler = useCallback(
    event => {
      store.setFilterString(event.target.value.toLowerCase());
    },
    [store]
  );

  const onClearHandler = useCallback(() => {
    store.setFilterString("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [store]);

  return useObserver(() => (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <div className={styles.icon}>
          <i className={"gg-search"} />
        </div>
        <input
          className={styles.input}
          onChange={onChangeHandler}
          value={store.filterString}
          size={1}
          autoFocus
          ref={inputRef}
        />
        {store.filterString !== "" && (
          <div className={cx(styles.icon, styles.iconHover)} onClick={onClearHandler}>
            <i className={"gg-close"} />
          </div>
        )}
      </div>
    </div>
  ));
};

export default FilterInput;
